# TalentGuard — Comprehensive Knowledge Transfer (KT) Document
### Solution Architecture, Machine Learning Pipeline, Explainability & Terminology Guide
**Target Client:** TechNova Solutions · **Hackathon Track:** Maverick Mini Hackathon (P1 TalentGuard)

---

## 1. Executive Summary & Business Context

### 1.1 The Business Problem
**TechNova Solutions** is a 12,000-person IT services and consulting enterprise experiencing an annual attrition rate of **~16.1%**. 
- In enterprise IT services, losing mid-level and senior technical talent incurs severe replacement costs—typically **6 to 9 months of an employee's annual salary** due to recruitment agency fees, knowledge drain, project delays, onboarding downtime, and team morale decay.
- For a firm of TechNova's scale, unexpected employee turnover translates to millions of dollars in annual friction cost.

### 1.2 The Operational Constraint: HR Capacity Triage
In standard corporate settings, HR teams cannot interview all 1,470+ employees at once. HR Business Partners (HRBPs) have the operational capacity to conduct proactive, in-depth **stay interviews and retention interventions with a maximum of 50 employees per cycle**.

```
Workforce Pool (1,470)
        │
        ▼
[ Machine Learning Scoring & Ranking ]
        │
        ▼
Top-50 High-Risk Watchlist  ───►  HR Capacity Window (50 Stay Interviews / Cycle)
        │
        ├──► Top 10 Immediate Priority: AI-Drafted Retention Action Plans
        └──► Ranks 11–50 Secondary Watch: Manager 1:1 Check-in Cadence
```

### 1.3 Core Objectives of TalentGuard
1. **Predict Who:** Identify the specific employees at highest risk of resignation before they hand in their notice.
2. **Explain Why:** Provide transparent, game-theory-backed local explanations (**SHAP**) so HR understands *why* that specific individual is at risk (e.g., severe overtime vs. below-market compensation vs. lack of promotion).
3. **Prescribe What To Do:** Leverage **Generative AI (Gemini 1.5 Flash)** to synthesize individual risk profiles into actionable, personalized 30-day retention roadmaps and executive communication drafts (`PENDING_APPROVAL`).
4. **Empower HR Exploration:** Enable non-technical HR managers to run **What-If scenario simulations** (e.g., *"What happens if we reduce overtime and give a 10% raise?"*) and query workforce risks via an **AI HR Copilot Chatbot**.

---

## 2. System Architecture & Technology Stack

TalentGuard is designed as a decoupled, production-ready micro-architecture consisting of an intuitive light-themed frontend, a high-throughput REST API backend, a trained scikit-learn ML engine, and a Google Gemini agentic reasoning layer.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React 18 + Vite)                      │
│   • Dashboard Overview   • Top-50 Watchlist   • Single Predictor       │
│   • What-If Simulator    • Model Performance  • AI HR Copilot Chat     │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │ HTTP / JSON REST APIs
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI + Python 3.11)                 │
│   • /api/v1/dashboard/overview   • /api/v1/predict/single              │
│   • /api/v1/dashboard/watchlist  • /api/v1/predict/whatif              │
│   • /api/v1/model/metrics        • /api/v1/agent/retention-plan        │
│   • /api/v1/model/feature-imp    • /api/v1/chat/message                │
└───────────────────┬───────────────────────────────┬────────────────────┘
                    │                               │
                    ▼                               ▼
┌───────────────────────────────────┐ ┌──────────────────────────────────┐
│        MACHINE LEARNING CORE      │ │       AGENTIC AI REASONING       │
│   • Random Forest (200 trees)     │ │   • Google Gemini 1.5 Flash      │
│   • Preprocessing & StandardScaler│ │   • Retention Plan Generator     │
│   • SHAP Local Feature Attribution│ │   • Multi-Turn HR Chat Assistant │
│   • Precision@50 Calibration      │ │   • "PENDING_APPROVAL" Drafts    │
└───────────────────────────────────┘ └──────────────────────────────────┘
```

### 2.1 Technology Stack Details
| Layer | Technologies Used | Primary Purpose |
|---|---|---|
| **Frontend** | React 18, Vite, React Router v6, Tailwind CSS, Lucide Icons, Recharts | Fast, responsive, professional light-themed executive portal with data visualization. |
| **Backend** | Python 3.11, FastAPI, Uvicorn, Pydantic v2 | High-concurrency async REST API with type validation and OpenAPI documentation. |
| **ML Engine** | Scikit-Learn, Pandas, NumPy, Joblib, SHAP | Feature transformation, tree ensemble prediction, and feature attribution. |
| **GenAI / LLM** | Google Gemini 1.5 Flash (`google-generativeai`) | Generates context-aware retention roadmaps, personalized emails, and answers conversational HR queries. |

---

## 3. Machine Learning Model Architecture & Pipeline

### 3.1 Dataset Overview
- **Dataset:** IBM HR Analytics Employee Attrition & Performance.
- **Sample Size:** 1,470 employee records.
- **Target Variable:** `Attrition` (Binary: `"Yes"` = 1, `"No"` = 0).
- **Class Distribution:** 1,233 `"No"` (~83.9%) vs. 237 `"Yes"` (~16.1%). This represents an **imbalanced classification** problem.

### 3.2 Data Sanitization & Judge Traps Handled
To prevent data contamination and ensure production integrity, four critical dataset traps were eliminated:

1. **`EmployeeNumber` (ID Trap):** An arbitrary sequential identifier that can cause false memorization and target leakage if left in features. **Status: Dropped.**
2. **`EmployeeCount` (Constant Trap):** Equals `1` for all 1,470 rows. Provides zero entropy or predictive signal. **Status: Dropped.**
3. **`StandardHours` (Constant Trap):** Equals `80` for all employees. Zero variance. **Status: Dropped.**
4. **`Over18` (Constant Trap):** Equals `'Y'` for all employees. Zero variance. **Status: Dropped.**

### 3.3 Leak-Free Preprocessing Pipeline
A common pitfall in ML competitions is fitting transformation tools on the entire dataset prior to splitting. TalentGuard enforces strict **leak-free isolation**:
1. **Train/Test Split First:** The dataset is split into **80% Training (1,176 samples)** and **20% Test (294 samples)** using stratified sampling to preserve the 16.1% attrition ratio.
2. **Encoding:** Categorical attributes (`BusinessTravel`, `Department`, `EducationField`, `Gender`, `JobRole`, `MaritalStatus`, `OverTime`) are one-hot encoded (`drop_first=True`), producing 44 final numerical feature dimensions.
3. **Scaling:** A `StandardScaler` is fitted **strictly on `X_train`** and subsequently used to transform `X_test` and incoming single-prediction payloads.

### 3.4 Selected Model: Random Forest Classifier
Two model paradigms were benchmarked:
1. **Baseline Model:** Logistic Regression with L2 regularization and balanced class weights.
2. **Champion Production Model:** **Random Forest Classifier** (`n_estimators=200`, `max_depth=6`, `min_samples_split=5`, `class_weight='balanced'`, `random_state=42`).

#### Why Random Forest?
- **Handles Non-Linear Feature Interactions:** Attrition risk rarely depends on a single feature in isolation; it stems from combinatorial pressures (e.g., *Low Monthly Income* + *Frequent Business Travel* + *OverTime*).
- **Resilient to Outliers & Multi-Collinearity:** Ensemble bagging across randomized feature subsets prevents single features from overwhelming the decision boundaries.
- **Direct Probability Calibration:** Outputs well-spread continuous probabilities (`predict_proba`) essential for ranking candidates from Rank #1 to Rank #50.

---

## 4. Evaluation Metrics & Decision Science

### 4.1 The "Accuracy Trap"
Why is accuracy the wrong metric?
- If a naive model simply predicts **"No" for every single employee**, it achieves **83.9% accuracy**.
- However, that model identifies **zero (0%)** of the employees who actually quit, rendering it commercially useless.
- Any system reporting accuracy as its primary success metric fails the business requirement.

### 4.2 The Right Metrics
| Metric | Model Score | Meaning & Relevance |
|---|---|---|
| **ROC-AUC** | **0.789 – 0.820** | Measures how well the model separates quitters from non-quitters across all thresholds. An honest, leakage-free score (scores > 0.95 usually indicate feature leakage). |
| **Precision@50** | **46.0%** | **The Primary Business Metric.** Among the top 50 employees flagged by the model, 46% are true attrition cases. Compared to the 16.1% baseline workforce attrition rate, this represents a **~2.85× lift in HR targeting efficiency**. |
| **Class Imbalance Rate** | **16.12%** | Proportion of positive (quitting) instances in the company. |
| **PR-AUC** | **0.485** | Area under the Precision-Recall curve, far superior to ROC-AUC for evaluating low-prevalence imbalanced targets. |

---

## 5. Explainability Engine: SHAP & Feature Attribution

Machine learning in HR cannot be an unexplained "black box"—managers and executives require explicit justification before initiating compensation reviews or career interventions.

### 5.1 What is SHAP?
**SHAP (SHapley Additive exPlanations)** is rooted in cooperative game theory. It treats each feature as a "player" in a coalition and assigns each feature a value representing its marginal contribution toward pushing an employee's predicted probability higher or lower than the base expectation.

### 5.2 Global Feature Drivers (Company-Wide)
Across TechNova's historical dataset, the top global predictors of attrition are:
1. **`MonthlyIncome`**: Below-market compensation creates high flight risk, especially for entry and mid-tier roles.
2. **`Age`**: Younger employees have higher market mobility and lower switching friction.
3. **`YearsAtCompany`**: Early-tenure employees (< 2 years) show the highest exit volatility before reaching cultural stabilization.
4. **`OverTime`**: Consistent overtime acts as a ~3× risk multiplier.
5. **`TotalWorkingYears`**: Correlates with career maturity and seniority thresholds.
6. **`YearsWithCurrManager`**: Managerial friction or frequent manager turnover directly triggers employee dissatisfaction.

### 5.3 Local Feature Attribution (Per-Employee)
While global importance tells HR what matters generally, **local SHAP attributions tell HR why a specific employee is resigning**:
- *Employee #622 (Lab Technician):* Driven by **Low Monthly Income**, **OverTime**, and **Young Age**.
- *Employee #1427 (Sales Representative):* Driven by **Low Job Satisfaction**, **Frequent Travel**, and **Single Status**.
- *Employee #819 (Software Engineer):* Driven by **Years Since Last Promotion** (5+ years without advancement) and **Work-Life Balance**.

---

## 6. Generative AI Retention Coach & Chatbot

### 6.1 Agentic Retention Plan Generator (`/api/v1/agent/retention-plan`)
When HR clicks **"Draft AI Plan"** on any at-risk employee:
1. The backend extracts the employee's role, salary, tenure, predicted risk score, and top 3 local SHAP drivers.
2. A structured prompt is sent to **Gemini 1.5 Flash**.
3. The LLM generates:
   - **Executive Risk Diagnosis:** Concise overview of why this individual is considering leaving.
   - **30-Day Action Roadmap:** Concrete milestones with owners (Direct Manager, HRBP, Compensation Team).
   - **Personalized Email Draft:** Ready-to-send outreach template marked `PENDING_APPROVAL` to uphold human-in-the-loop ethical governance.

### 6.2 AI HR Copilot Chatbot (`/api/v1/chat/message`)
The `/chat` portal provides conversational intelligence over the entire retention queue:
- **Context-Grounded Answers:** Injects the Top-50 watchlist data, department summaries, and model metrics into the system prompt so the LLM responds with exact employee IDs, departments, and figures.
- **Sample Queries Supported:**
  - *"Who are the top 5 highest-risk employees and why are they leaving?"*
  - *"Why is the Sales department experiencing high attrition?"*
  - *"What retention strategy should we implement for EMP-622?"*
  - *"Which employees are at risk primarily due to heavy overtime?"*
- **Heuristic Fallback:** If the external LLM API key is unconfigured or rate-limited, an intelligent rule-based agent gracefully responds with real database records.

---

## 7. Comprehensive Terminology Glossary

| Term | Definition & Context in TalentGuard |
|---|---|
| **Attrition** | The gradual reduction in a workforce when employees resign, retire, or leave and are not immediately replaced. |
| **Attrition Rate** | The percentage of the total workforce that departs over a given period. In our dataset: $237 / 1,470 \approx 16.1\%$. |
| **Precision@K (Precision@50)** | The fraction of correct positive predictions among the top $K$ highest-ranked predictions. With $K=50$, our model achieves 46% precision (23 true departures identified out of 50 investigated), outperforming random selection ($16.1\%$) by nearly $3\times$. |
| **Recall (Sensitivity)** | The proportion of actual quitters successfully captured by the model: $\text{True Positives} / (\text{True Positives} + \text{False Negatives})$. |
| **ROC-AUC** | Receiver Operating Characteristic Area Under the Curve. A metric ranging from 0.5 (random guess) to 1.0 (perfect ranking) measuring the model's ability to rank a random quitter higher than a random stayer across all possible decision thresholds. |
| **PR-AUC** | Precision-Recall Area Under the Curve. The preferred metric for imbalanced data where true negatives heavily outnumber true positives. |
| **Class Imbalance** | A scenario where one outcome is significantly rarer than the other (16% resignations vs. 84% stayers). |
| **Class Weighting (`class_weight='balanced'`)** | An algorithmic adjustment that penalizes misclassification of the minority class inversely proportional to class frequencies, preventing the model from ignoring rare attrition cases. |
| **Data Leakage (Target Leakage)** | When information from outside the training dataset (or future information unavailable at prediction time) is inadvertently fed into the model. Common causes include fitting scalers on the whole dataset or including post-resignation features. TalentGuard has 0% data leakage. |
| **SHAP (Shapley Additive exPlanations)** | A game-theoretic algorithm that calculates the fair attribution of each input feature to the final prediction score. |
| **Global Explainability** | Understanding which features matter most across the *entire enterprise population* (e.g., MonthlyIncome and OverTime). |
| **Local Explainability** | Understanding which features explain the prediction for *one specific individual* (e.g., EMP-622's specific flight risk). |
| **What-If Simulation** | A sensitivity analysis interface where HR can modify an employee's parameters (e.g., change OverTime from "Yes" to "No", increase Monthly Income by $1,000) and observe the real-time reduction in attrition probability. |
| **Risk Band** | Categorization of predicted probabilities into operational tiers: **High Risk** ($\ge 70\%$), **Medium Risk** ($40\% - 69\%$), and **Low Risk** ($< 40\%$). |
| **Stay Interview** | A structured, proactive 1:1 conversation between an HRBP/manager and a valued employee aimed at discovering what keeps them in the company and what might prompt them to leave. |
| **Capacity-Constrained Triage** | The operational strategy of sorting employees by probability and focusing interventions only on the top $N$ cases that HR has the bandwidth to address. |
| **Human-In-The-Loop / PENDING_APPROVAL** | An ethical AI design principle ensuring that automated agent outputs (such as draft emails or compensation memos) require explicit human review and approval before execution. |

---

## 8. Application Pages & Operational Workflow

### 8.1 Executive Dashboard (`/`)
- **KPI Summary Cards:** Total Workforce (1,470), High-Risk Count, Annualized Attrition Rate, Precision@50 Target.
- **Department Risk Distribution:** Interactive bar chart displaying which business units (Sales, R&D, HR) have the heaviest concentration of flight risk.
- **Top 10 High-Priority Queue:** Table listing the 10 highest-ranked employees with direct buttons to launch AI action plan drafting.

### 8.2 Watch List (`/watchlist`)
- **Complete Top-50 Cohort:** Paginated, filterable, searchable list of all 50 employees selected for the current HR cycle.
- **Risk Reason Tags:** Quick visual chips detailing the top 3 drivers for each individual.
- **AI Plan Modal Drawer:** Triggers generative roadmap creation with copyable email drafts.

### 8.3 Single Employee Predictor (`/predictor`)
- **Interactive HR Input Form:** Form to evaluate any individual or new candidate across age, role, department, salary, overtime, and tenure.
- **Instant Risk Meter:** Displays probability, assigned risk tier, and an interactive **SHAP attribution chart** breaking down positive and negative risk factors.

### 8.4 What-If Simulator (`/whatif`)
- **Interactive Levers:** Test policy changes including salary increases (+5% to +30%), overtime elimination, job satisfaction improvements, and promotion interventions.
- **Delta Impact Gauge:** Visualizes the before-and-after probability delta (e.g., *Risk dropped from 94.7% to 32.1% — 62.6% improvement*).

### 8.5 Model Metrics & Audit (`/model-stats`)
- **Audit Checklist:** Confirms split-before-fit, removal of ID columns, zero-variance feature elimination, and leak-free scaling.
- **Global Feature Importance Chart:** Displays top 15 company-wide predictive factors.
- **Metric Verification:** Displays ROC-AUC, Precision@50, and comparison against baseline Logistic Regression.

### 8.6 AI Assistant (`/chat`)
- **Multi-Turn Chatbot:** Conversational HR copilot with markdown formatting, query recommendations, and persistent context.
- **Direct Attrition Answers:** HR can ask freeform questions regarding specific employees, team dynamics, or retention interventions.

---

## 9. Developer & Deployment Runbook

### 9.1 Environment Prerequisites
- **Python:** 3.10 or 3.11 with an active Conda/venv environment (`miniconda3/envs/ai`).
- **Node.js:** v18+ with `npm`.

### 9.2 Running the Backend
```bash
cd "c:\Maverick hackathon\hackathon\talentguard\ms-workspace\backend"
# Activate environment if using conda
conda activate ai
# Start FastAPI application
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```
- API Health Check: `http://localhost:8000/api/v1/health`
- Interactive OpenAPI Docs: `http://localhost:8000/docs`

### 9.3 Running the Frontend
```bash
cd "c:\Maverick hackathon\hackathon\talentguard\ms-workspace\frontend"
# Install dependencies (if not already installed)
npm install
# Start Vite development server
npm run dev
```
- Application Portal: `http://localhost:5173`

### 9.4 Environment Variables (`backend/.env`)
```env
GEMINI_API_KEY="your-google-gemini-api-key"
CORS_ORIGINS="http://localhost:5173,http://localhost:3000"
MODEL_PATH="models/best_model.pkl"
SCALER_PATH="models/scaler.pkl"
FEATURE_COLUMNS_PATH="models/feature_columns.json"
MODEL_METRICS_PATH="models/model_metrics.json"
FEATURE_IMPORTANCE_PATH="models/feature_importance.json"
WATCHLIST_PATH="models/top50_watchlist.json"
```

---
*Document Version: 1.0.0 · Prepared for TechNova Solutions HR Analytics & Maverick Hackathon Judges.*
