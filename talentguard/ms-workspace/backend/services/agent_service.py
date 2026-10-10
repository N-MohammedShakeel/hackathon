import os
import json
import google.generativeai as genai
from config import GEMINI_API_KEY
from schemas import RetentionPlanRequest, RetentionPlan, RetentionAction

class AgentService:
    def __init__(self):
        self.api_key = GEMINI_API_KEY
        if self.api_key and self.api_key.strip() and not self.api_key.startswith("your_gemini"):
            try:
                genai.configure(api_key=self.api_key)
                self.model = genai.GenerativeModel('gemini-1.5-flash')
            except Exception as e:
                print(f"Failed to initialize Gemini AI: {e}")
                self.model = None
        else:
            self.model = None

    def generate_retention_plan(self, req: RetentionPlanRequest) -> RetentionPlan:
        # Prepare context from SHAP factors
        top_factors_text = "\n".join([
            f"- {f.label} ({f.direction}, impact score: {f.impact})"
            for f in req.shap_factors[:3]
        ])

        if self.model:
            try:
                prompt = f"""
                You are an expert HR Retention Coach at TechNova Solutions.
                An employee has an attrition risk probability of {req.probability * 100:.1f}% (Risk Band: {req.risk_band}).
                Department: {req.department or 'N/A'}, Job Role: {req.job_role or 'N/A'}.
                
                Top Risk Factors identified by ML Explainability (SHAP):
                {top_factors_text}

                Please provide a structured JSON response with:
                1. "risk_summary": A concise 2-sentence summary of why this employee is at risk.
                2. "actions": A list of 3 concrete, prioritized retention actions. Each action must have "action", "priority" ("High"/"Medium"), "rationale", "timeline", and "owner".
                3. "email_draft": A professional retention outreach email draft to the employee's manager outlining recommended steps. Must start with "[PENDING_APPROVAL - Review before sending]" banner.

                Output strictly valid JSON matching this schema:
                {{
                    "risk_summary": "...",
                    "actions": [
                        {{"action": "...", "priority": "High", "rationale": "...", "timeline": "...", "owner": "..."}}
                    ],
                    "email_draft": "[PENDING_APPROVAL - Review before sending]\\n\\nSubject: ...\\n\\nDear Manager,\\n\\n..."
                }}
                """
                response = self.model.generate_content(prompt)
                text = response.text.strip()

                # Clean markdown formatting if present
                if text.startswith("```json"):
                    text = text[7:]
                if text.endswith("```"):
                    text = text[:-3]
                text = text.strip()

                data = json.loads(text)
                
                actions = [RetentionAction(**act) for act in data.get("actions", [])]
                
                return RetentionPlan(
                    employee_id=req.employee_id,
                    risk_summary=data.get("risk_summary", f"Employee exhibits a {req.risk_band} attrition risk of {req.probability * 100:.1f}%."),
                    actions=actions,
                    email_draft=data.get("email_draft", ""),
                    email_status="PENDING_APPROVAL"
                )
            except Exception as e:
                print(f"Gemini generation error: {e}. Falling back to rule engine.")

        # Fallback Rule-Based Agent Engine
        return self._generate_fallback_plan(req)

    def _generate_fallback_plan(self, req: RetentionPlanRequest) -> RetentionPlan:
        top_factor_labels = [f.label for f in req.shap_factors[:3]]
        factor_str = ", ".join(top_factor_labels) if top_factor_labels else "Key retention risk metrics"

        actions = [
            RetentionAction(
                action="Schedule 1:1 Workload & Career Alignment Discussion",
                priority="High" if req.probability >= 0.7 else "Medium",
                rationale=f"Addressed driver: {req.shap_factors[0].label if req.shap_factors else 'Risk Mitigation'}",
                timeline="Within 7 business days",
                owner="Direct Line Manager"
            ),
            RetentionAction(
                action="Review Compensation & Recognition Benchmarks",
                priority="High" if req.probability >= 0.7 else "Medium",
                rationale="Proactively align pay & equity with industry standards",
                timeline="Within 14 business days",
                owner="HR Business Partner & Comp Team"
            ),
            RetentionAction(
                action="Offer Flexible Hours / Remote Hybrid Options",
                priority="Medium",
                rationale="Improve work-life balance satisfaction score",
                timeline="Within 30 business days",
                owner="Department Lead"
            )
        ]

        email_draft = f"""[PENDING_APPROVAL - Review before sending]

Subject: CONFIDENTIAL: Proactive Retention Outreach Strategy for Employee #{req.employee_id or 'N/A'} ({req.job_role or 'Staff Member'})

Dear Department Manager,

TalentGuard predictive analytics has identified a {req.risk_band} Attrition Risk ({req.probability * 100:.1f}%) for Employee #{req.employee_id or 'N/A'} in {req.department or 'your team'}.

Key Risk Drivers:
{factor_str}

Recommended Immediate Actions:
1. Conduct a confidential 1:1 stay interview to discuss career roadmap and current pressures.
2. Evaluate current workload distribution and flex-work options.
3. Review total compensation positioning against role peers.

Please review these recommendations and confirm approval to initiate the retention workflow.

Best regards,
TalentGuard AI Retention System
TechNova Solutions HR Analytics"""

        return RetentionPlan(
            employee_id=req.employee_id,
            risk_summary=f"Employee shows {req.risk_band} attrition probability ({req.probability * 100:.1f}%) primarily driven by {factor_str}.",
            actions=actions,
            email_draft=email_draft,
            email_status="PENDING_APPROVAL"
        )

agent_service = AgentService()
