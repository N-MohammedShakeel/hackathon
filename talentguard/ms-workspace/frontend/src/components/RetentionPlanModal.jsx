import React, { useState } from 'react';
import { X, Sparkles, Copy, Check, ShieldAlert, Mail, Clock, User, AlertCircle } from 'lucide-react';
import { generateRetentionPlan } from '../services/api';

export const RetentionPlanModal = ({ isOpen, onClose, employeeData }) => {
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [copied, setCopied] = useState(false);
  const [approved, setApproved] = useState(false);

  React.useEffect(() => {
    if (isOpen && employeeData) {
      setPlan(null);
      setApproved(false);
      fetchPlan();
    }
  }, [isOpen, employeeData]);

  const fetchPlan = async () => {
    setLoading(true);
    try {
      const req = {
        employee_id:    employeeData.employee_id   || 1001,
        probability:    employeeData.attrition_probability || 0.85,
        risk_band:      employeeData.risk_band      || 'High',
        department:     employeeData.department     || 'Sales',
        job_role:       employeeData.job_role       || 'Sales Representative',
        monthly_income: employeeData.monthly_income || 2200,
        overtime:       employeeData.overtime       || 'Yes',
        years_at_company: employeeData.years_at_company || 1,
        shap_factors:   employeeData.top_risk_factors || employeeData.shap_explanation || [],
      };
      const res = await generateRetentionPlan(req);
      setPlan(res);
    } catch (err) {
      console.error('Failed to generate retention plan', err);
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

  const priorityConfig = {
    High:   'bg-rose-50 text-rose-700 border-rose-200',
    Medium: 'bg-amber-50 text-amber-700 border-amber-200',
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)' }}>
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl border border-slate-200 fade-in">
        {/* ── Modal Header ── */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
            <Sparkles className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              AI Retention Coach
              <span className="text-[10px] font-normal bg-indigo-50 text-indigo-600 border border-indigo-100 px-2 py-0.5 rounded-full">
                Gemini 1.5 Flash
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Employee #{employeeData?.employee_id} · {employeeData?.job_role} · {employeeData?.department}
            </p>
          </div>
          <button
            id="btn-close-retention-modal"
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ── Body ── */}
        <div className="px-6 py-5">
          {loading ? (
            <div className="py-14 flex flex-col items-center gap-3 text-center">
              <div className="w-10 h-10 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" style={{ borderWidth: 3 }} />
              <p className="text-sm font-medium text-slate-700">Synthesising SHAP insights…</p>
              <p className="text-xs text-slate-400">Drafting personalised retention strategy via Gemini AI</p>
            </div>
          ) : plan ? (
            <div className="space-y-5">
              {/* Risk Summary */}
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-100 flex gap-3">
                <ShieldAlert className="w-4 h-4 text-rose-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">Attrition Risk Summary</p>
                  <p className="text-sm text-rose-900 leading-relaxed">{plan.risk_summary}</p>
                </div>
              </div>

              {/* Actions */}
              <div>
                <h3 className="text-sm font-semibold text-slate-800 mb-3">Prioritised Retention Interventions</h3>
                <div className="space-y-2">
                  {plan.actions.map((act, i) => (
                    <div key={i} className="p-4 rounded-xl border border-slate-100 bg-slate-50 hover:border-indigo-200 transition-colors">
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3 flex-1">
                          <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                            {i + 1}
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-900">{act.action}</p>
                            <p className="text-xs text-slate-500 mt-1">{act.rationale}</p>
                            <div className="flex items-center gap-3 mt-2 text-[10px] text-slate-400">
                              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{act.timeline}</span>
                              <span className="flex items-center gap-1"><User className="w-3 h-3" />{act.owner}</span>
                            </div>
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-1 rounded-full font-bold border shrink-0 ${priorityConfig[act.priority] || priorityConfig.Medium}`}>
                          {act.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Email Draft */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                    <Mail className="w-4 h-4 text-indigo-500" />
                    Auto-Drafted Retention Email
                  </h3>
                  <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold border ${
                    approved
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                  }`}>
                    {approved ? '✓ APPROVED' : 'PENDING APPROVAL'}
                  </span>
                </div>

                <div className="relative p-4 rounded-xl border border-slate-200 bg-slate-50 font-mono text-xs text-slate-700 leading-relaxed whitespace-pre-wrap max-h-48 overflow-y-auto">
                  {plan.email_draft}
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    id="btn-copy-email"
                    onClick={handleCopy}
                    className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium border border-slate-200 rounded-lg bg-white hover:bg-slate-50 text-slate-700 transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied!' : 'Copy Email'}
                  </button>
                  <button
                    id="btn-approve-email"
                    onClick={() => setApproved(!approved)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-colors ${
                      approved
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white'
                    }`}
                  >
                    {approved ? 'Approved ✓ — Ready to Send' : 'Approve Draft for Sending'}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="py-12 flex flex-col items-center gap-2 text-slate-400">
              <AlertCircle className="w-8 h-8" />
              <p className="text-sm">Failed to generate plan. Please retry.</p>
              <button onClick={fetchPlan} className="mt-2 px-4 py-2 text-xs bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                Retry
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
