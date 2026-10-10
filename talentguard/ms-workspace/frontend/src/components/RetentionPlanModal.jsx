import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, ShieldAlert, Mail } from 'lucide-react';
import { generateRetentionPlan } from '../services/api';

export const RetentionPlanModal = ({ isOpen, onClose, employeeData }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [copied, setCopied] = useState(false);
  const [approved, setApproved] = useState(false);

  React.useEffect(() => {
    if (isOpen && employeeData && !plan) {
      fetchPlan();
    }
  }, [isOpen, employeeData]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const req = {
        employee_id: employeeData.employee_id || 1001,
        probability: employeeData.attrition_probability || 0.85,
        risk_band: employeeData.risk_band || 'High',
        department: employeeData.department || 'Sales',
        job_role: employeeData.job_role || 'Sales Representative',
        monthly_income: employeeData.monthly_income || 2200,
        overtime: employeeData.overtime || 'Yes',
        years_at_company: employeeData.years_at_company || 1,
        shap_factors: employeeData.top_risk_factors || employeeData.shap_explanation || []
      };
      const res = await generateRetentionPlan(req);
      setPlan(res);
    } catch (err) {
      console.error("Failed to generate retention plan", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (plan?.email_draft) {
      navigator.clipboard.writeText(plan.email_draft);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto glass-panel border border-slate-700 p-6 shadow-2xl rounded-2xl">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4 mb-5">
          <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-xl border border-indigo-500/30">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              AI Retention Coach Agent
              <span className="text-xs bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-2 py-0.5 rounded-full font-normal">
                Gemini 1.5 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Auto-generated retention strategy & manager outreach draft for Employee #{employeeData?.employee_id || 'ID'}
            </p>
          </div>
        </div>

        {loading ? (
          <div className="py-12 text-center">
            <div className="inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            <p className="mt-3 text-sm text-slate-400">Synthesizing SHAP explainability insights & drafting plan...</p>
          </div>
        ) : plan ? (
          <div className="space-y-6">
            {/* Risk Summary */}
            <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl">
              <h4 className="text-xs font-semibold text-rose-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <ShieldAlert className="w-4 h-4" /> Attrition Risk Summary
              </h4>
              <p className="text-sm text-slate-200">{plan.risk_summary}</p>
            </div>

            {/* Recommended Actions */}
            <div>
              <h3 className="text-sm font-semibold text-slate-300 mb-3">Prioritized Retention Interventions</h3>
              <div className="space-y-2.5">
                {plan.actions.map((act, i) => (
                  <div key={i} className="p-3.5 bg-slate-900/90 border border-slate-800 rounded-lg flex items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-indigo-500/20 text-indigo-400 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <h4 className="text-sm font-semibold text-white">{act.action}</h4>
                      </div>
                      <p className="text-xs text-slate-400 mt-1 pl-7">{act.rationale}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <span className={`text-xs px-2 py-0.5 rounded font-medium ${act.priority === 'High' ? 'bg-rose-500/20 text-rose-300' : 'bg-amber-500/20 text-amber-300'}`}>
                        {act.priority} Priority
                      </span>
                      <p className="text-[11px] text-slate-500 mt-1">{act.timeline} · {act.owner}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Auto-Drafted Retention Email - Bonus Feature */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-400" /> Auto-Drafted Retention Email
                </h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${approved ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30 animate-pulse'}`}>
                  {approved ? 'APPROVED & READY' : 'PENDING_APPROVAL'}
                </span>
              </div>

              <div className="relative p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-wrap max-h-56 overflow-y-auto">
                {plan.email_draft}
              </div>

              <div className="mt-3 flex items-center justify-between">
                <button
                  onClick={handleCopy}
                  className="px-3.5 py-2 text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied to Clipboard' : 'Copy Email Text'}
                </button>

                <button
                  onClick={() => setApproved(!approved)}
                  className={`px-4 py-2 text-xs font-semibold rounded-lg transition-colors ${approved ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-indigo-600 hover:bg-indigo-500 text-white'}`}
                >
                  {approved ? 'Approved ✓' : 'Approve Draft for Sending'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-slate-400 text-sm">Failed to load plan.</div>
        )}
      </div>
    </div>
  );
};
