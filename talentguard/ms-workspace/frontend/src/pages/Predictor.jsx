import React, { useState } from 'react';
import { predictSingleEmployee } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { ShapChart } from '../components/ShapChart';
import { RetentionPlanModal } from '../components/RetentionPlanModal';
import { UserCheck, Sparkles, Activity } from 'lucide-react';

const fieldClass = "w-full border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 bg-white outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 transition";
const labelClass = "block text-xs font-medium text-slate-600 mb-1";

export const Predictor = () => {
  const [formData, setFormData] = useState({
    Age: 29,
    BusinessTravel: 'Travel_Frequently',
    DailyRate: 500,
    Department: 'Sales',
    DistanceFromHome: 25,
    Education: 2,
    EducationField: 'Life Sciences',
    EnvironmentSatisfaction: 1,
    Gender: 'Female',
    HourlyRate: 45,
    JobInvolvement: 1,
    JobLevel: 1,
    JobRole: 'Sales Representative',
    JobSatisfaction: 1,
    MaritalStatus: 'Single',
    MonthlyIncome: 2200,
    MonthlyRate: 12000,
    NumCompaniesWorked: 5,
    OverTime: 'Yes',
    PercentSalaryHike: 12,
    PerformanceRating: 3,
    RelationshipSatisfaction: 1,
    StockOptionLevel: 0,
    TotalWorkingYears: 3,
    TrainingTimesLastYear: 2,
    WorkLifeBalance: 1,
    YearsAtCompany: 1,
    YearsInCurrentRole: 1,
    YearsSinceLastPromotion: 0,
    YearsWithCurrManager: 1,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? Number(value) : value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await predictSingleEmployee(formData);
      setResult(res);
    } catch (err) {
      console.error('Prediction error', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5 fade-in">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <UserCheck className="w-5 h-5 text-indigo-600" />
          Single Employee Attrition Predictor
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Input employee attributes for a real-time risk score, SHAP feature explanation, and AI recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Form ── */}
        <form onSubmit={handleSubmit} className="glass-panel p-6 lg:col-span-7 space-y-5">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-500" />
            Employee Profile Parameters
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Age</label>
              <input type="number" name="Age" value={formData.Age} onChange={handleChange} min="18" max="65" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Department</label>
              <select name="Department" value={formData.Department} onChange={handleChange} className={fieldClass}>
                <option value="Sales">Sales</option>
                <option value="Research & Development">Research & Development</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Job Role</label>
              <select name="JobRole" value={formData.JobRole} onChange={handleChange} className={fieldClass}>
                <option value="Sales Representative">Sales Representative</option>
                <option value="Sales Executive">Sales Executive</option>
                <option value="Research Scientist">Research Scientist</option>
                <option value="Laboratory Technician">Laboratory Technician</option>
                <option value="Manufacturing Director">Manufacturing Director</option>
                <option value="Manager">Manager</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Monthly Income ($)</label>
              <input type="number" name="MonthlyIncome" value={formData.MonthlyIncome} onChange={handleChange} step="100" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Overtime Work?</label>
              <select name="OverTime" value={formData.OverTime} onChange={handleChange} className={`${fieldClass} ${formData.OverTime === 'Yes' ? 'text-rose-600 font-semibold' : ''}`}>
                <option value="Yes">Yes (High Risk Factor)</option>
                <option value="No">No</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Business Travel</label>
              <select name="BusinessTravel" value={formData.BusinessTravel} onChange={handleChange} className={fieldClass}>
                <option value="Travel_Frequently">Travel Frequently</option>
                <option value="Travel_Rarely">Travel Rarely</option>
                <option value="Non-Travel">Non-Travel</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Job Satisfaction (1–4)</label>
              <input type="number" name="JobSatisfaction" value={formData.JobSatisfaction} onChange={handleChange} min="1" max="4" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Work-Life Balance (1–4)</label>
              <input type="number" name="WorkLifeBalance" value={formData.WorkLifeBalance} onChange={handleChange} min="1" max="4" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Years at Company</label>
              <input type="number" name="YearsAtCompany" value={formData.YearsAtCompany} onChange={handleChange} min="0" max="40" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Distance from Home (mi)</label>
              <input type="number" name="DistanceFromHome" value={formData.DistanceFromHome} onChange={handleChange} min="1" max="30" className={fieldClass} />
            </div>
            <div>
              <label className={labelClass}>Marital Status</label>
              <select name="MaritalStatus" value={formData.MaritalStatus} onChange={handleChange} className={fieldClass}>
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>
            <div>
              <label className={labelClass}>Stock Option Level (0–3)</label>
              <input type="number" name="StockOptionLevel" value={formData.StockOptionLevel} onChange={handleChange} min="0" max="3" className={fieldClass} />
            </div>
          </div>

          <button
            type="submit"
            id="btn-run-inference"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm flex items-center justify-center gap-2 transition-colors shadow-sm mt-2"
          >
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running inference…</>
              : <><Activity className="w-4 h-4" /> Run Attrition Inference</>
            }
          </button>
        </form>

        {/* ── Result Panel ── */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <>
              {/* Risk Score Card */}
              <div className="glass-panel p-5 border-l-4 border-l-indigo-500">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Inference Result</p>
                  {result.processing_time_ms && (
                    <span className="text-[10px] text-slate-400 font-mono">{result.processing_time_ms}ms</span>
                  )}
                </div>
                <div className="flex items-baseline justify-between">
                  <div>
                    <div className="text-4xl font-extrabold text-slate-900">
                      {(result.attrition_probability * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-slate-500 mt-1">Probability of attrition next cycle</p>
                  </div>
                  <RiskBadge band={result.risk_band} />
                </div>

                {/* Risk bar */}
                <div className="mt-4">
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(result.attrition_probability * 100)}%`,
                        background: result.attrition_probability >= 0.7 ? '#dc2626' : result.attrition_probability >= 0.4 ? '#d97706' : '#16a34a'
                      }}
                    />
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-400 mt-1">
                    <span>Low Risk</span><span>Medium</span><span>High Risk</span>
                  </div>
                </div>

                <button
                  id="btn-draft-plan-predictor"
                  onClick={() => setModalOpen(true)}
                  className="w-full mt-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Draft AI Retention Plan & Email
                </button>
              </div>

              {/* SHAP Chart */}
              <div className="glass-panel p-5">
                <h4 className="text-sm font-semibold text-slate-800 mb-3">SHAP Feature Impact Drivers</h4>
                <ShapChart factors={result.shap_explanation} />
              </div>
            </>
          ) : (
            <div className="glass-panel h-full min-h-[300px] flex flex-col items-center justify-center text-center p-8">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-4">
                <Activity className="w-7 h-7 text-indigo-400" />
              </div>
              <h3 className="text-sm font-semibold text-slate-700">No Prediction Yet</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-xs">
                Fill in the employee profile on the left and click "Run Attrition Inference" to see the result.
              </p>
            </div>
          )}
        </div>
      </div>

      <RetentionPlanModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeData={{
          employee_id: 999,
          attrition_probability: result?.attrition_probability,
          risk_band: result?.risk_band,
          department: formData.Department,
          job_role: formData.JobRole,
          monthly_income: formData.MonthlyIncome,
          overtime: formData.OverTime,
          years_at_company: formData.YearsAtCompany,
          top_risk_factors: result?.shap_explanation
        }}
      />
    </div>
  );
};
