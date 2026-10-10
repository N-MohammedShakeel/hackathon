import React, { useState } from 'react';
import { predictSingleEmployee } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { ShapChart } from '../components/ShapChart';
import { RetentionPlanModal } from '../components/RetentionPlanModal';
import { UserCheck, Sparkles, Activity, AlertTriangle, ChevronRight } from 'lucide-react';

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
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await predictSingleEmployee(formData);
      setResult(res);
    } catch (err) {
      console.error("Prediction error", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Single Employee Attrition Predictor</h1>
        <p className="text-xs text-slate-400 mt-1">
          Input employee attributes to generate real-time risk score, SHAP feature impact explanation, and AI recommendations.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Form */}
        <form onSubmit={handleSubmit} className="glass-panel p-5 lg:col-span-7 space-y-4">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-indigo-400" /> Employee Profile Parameters
          </h3>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1">Age</label>
              <input type="number" name="Age" value={formData.Age} onChange={handleChange} min="18" max="65" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Department</label>
              <select name="Department" value={formData.Department} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white">
                <option value="Sales">Sales</option>
                <option value="Research & Development">Research & Development</option>
                <option value="Human Resources">Human Resources</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Job Role</label>
              <select name="JobRole" value={formData.JobRole} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white">
                <option value="Sales Representative">Sales Representative</option>
                <option value="Sales Executive">Sales Executive</option>
                <option value="Research Scientist">Research Scientist</option>
                <option value="Laboratory Technician">Laboratory Technician</option>
                <option value="Manufacturing Director">Manufacturing Director</option>
                <option value="Manager">Manager</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Monthly Income ($)</label>
              <input type="number" name="MonthlyIncome" value={formData.MonthlyIncome} onChange={handleChange} step="100" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Overtime Work?</label>
              <select name="OverTime" value={formData.OverTime} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white font-semibold text-amber-400">
                <option value="Yes">Yes (High Risk Factor)</option>
                <option value="No">No</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Business Travel</label>
              <select name="BusinessTravel" value={formData.BusinessTravel} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white">
                <option value="Travel_Frequently">Travel Frequently</option>
                <option value="Travel_Rarely">Travel Rarely</option>
                <option value="Non-Travel">Non-Travel</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Job Satisfaction (1-4)</label>
              <input type="number" name="JobSatisfaction" value={formData.JobSatisfaction} onChange={handleChange} min="1" max="4" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Work-Life Balance (1-4)</label>
              <input type="number" name="WorkLifeBalance" value={formData.WorkLifeBalance} onChange={handleChange} min="1" max="4" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Years at Company</label>
              <input type="number" name="YearsAtCompany" value={formData.YearsAtCompany} onChange={handleChange} min="0" max="40" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Distance From Home (mi)</label>
              <input type="number" name="DistanceFromHome" value={formData.DistanceFromHome} onChange={handleChange} min="1" max="30" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Marital Status</label>
              <select name="MaritalStatus" value={formData.MaritalStatus} onChange={handleChange} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white">
                <option value="Single">Single</option>
                <option value="Married">Married</option>
                <option value="Divorced">Divorced</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1">Stock Option Level (0-3)</label>
              <input type="number" name="StockOptionLevel" value={formData.StockOptionLevel} onChange={handleChange} min="0" max="3" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-white" />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all mt-4"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <>
                <Activity className="w-4 h-4" /> Run TalentGuard Attrition Inference
              </>
            )}
          </button>
        </form>

        {/* Prediction Output & SHAP Waterfall */}
        <div className="lg:col-span-5 space-y-4">
          {result ? (
            <>
              {/* Score Tile */}
              <div className="glass-panel p-5 border-indigo-500/30 bg-gradient-to-br from-indigo-950/40 via-slate-900 to-rose-950/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Inference Result</h3>
                  <span className="text-[10px] text-slate-500 font-mono">{result.processing_time_ms} ms execution</span>
                </div>

                <div className="mt-4 flex items-baseline justify-between">
                  <div>
                    <div className="text-4xl font-extrabold text-white tracking-tight">
                      {(result.attrition_probability * 100).toFixed(1)}%
                    </div>
                    <p className="text-xs text-slate-400 mt-1">Probability of Attrition next cycle</p>
                  </div>
                  <RiskBadge band={result.risk_band} />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800">
                  <button
                    onClick={() => setModalOpen(true)}
                    className="w-full py-2 bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs rounded-lg shadow-md flex items-center justify-center gap-2 transition-all"
                  >
                    <Sparkles className="w-4 h-4 text-amber-300" /> Draft Agentic Retention Plan & Email
                  </button>
                </div>
              </div>

              {/* SHAP Chart */}
              <div className="glass-panel p-5">
                <h4 className="text-xs font-semibold text-slate-300 mb-2">SHAP Feature Impact Drivers</h4>
                <ShapChart factors={result.shap_explanation} />
              </div>
            </>
          ) : (
            <div className="glass-panel p-8 text-center text-slate-400 text-xs flex flex-col items-center justify-center h-full">
              <Activity className="w-8 h-8 text-indigo-500/40 mb-3" />
              Fill parameters and click "Run Inference" to calculate real-time employee attrition probability and SHAP feature drivers.
            </div>
          )}
        </div>
      </div>

      {/* AI Retention Plan Modal */}
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
