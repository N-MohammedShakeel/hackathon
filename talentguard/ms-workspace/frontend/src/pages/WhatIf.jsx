import React, { useState } from 'react';
import { predictWhatIf } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { SlidersHorizontal, ArrowDown, ArrowUp, RefreshCw, CheckCircle2 } from 'lucide-react';

export const WhatIf = () => {
  const [baseEmployee] = useState({
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

  const [overrides, setOverrides] = useState({
    OverTime: 'No',
    MonthlyIncome: 3500,
    JobSatisfaction: 3,
    WorkLifeBalance: 3,
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleOverrideChange = (field, value) => {
    setOverrides(prev => ({ ...prev, [field]: value }));
  };

  const runSimulation = async () => {
    setLoading(true);
    try {
      const res = await predictWhatIf(baseEmployee, overrides);
      setResult(res);
    } catch (err) {
      console.error("Simulation error", err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    runSimulation();
  }, [overrides]);

  return (
    <div className="space-y-6">
      {/* Title */}
      <div>
        <h1 className="text-2xl font-bold text-white tracking-tight">Interactive What-If Retention Simulator</h1>
        <p className="text-xs text-slate-400 mt-1">
          Simulate HR policy interventions (e.g. eliminating overtime, salary raises, flex work) and observe real-time reduction in employee attrition risk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Intervention Controls */}
        <div className="glass-panel p-5 lg:col-span-6 space-y-5">
          <h3 className="text-sm font-semibold text-slate-200 border-b border-slate-800 pb-2 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-400" /> HR Policy Intervention Handles
          </h3>

          <div className="space-y-4">
            {/* Overtime Toggle */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl flex items-center justify-between">
              <div>
                <label className="text-xs font-semibold text-white block">Overtime Policy</label>
                <span className="text-[11px] text-slate-400">Baseline: Works Overtime (Yes)</span>
              </div>
              <select
                value={overrides.OverTime}
                onChange={(e) => handleOverrideChange('OverTime', e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs font-semibold text-indigo-300 rounded-lg px-3 py-1.5 focus:outline-none"
              >
                <option value="No">No Overtime (Eliminate)</option>
                <option value="Yes">Keep Overtime (Yes)</option>
              </select>
            </div>

            {/* Salary Slider */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-white">Monthly Income ($)</label>
                <span className="text-indigo-400 font-mono font-bold">${overrides.MonthlyIncome}</span>
              </div>
              <input
                type="range"
                min="2000"
                max="8000"
                step="100"
                value={overrides.MonthlyIncome}
                onChange={(e) => handleOverrideChange('MonthlyIncome', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>Base: $2,200</span>
                <span>Max Benchmark: $8,000</span>
              </div>
            </div>

            {/* Job Satisfaction */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-white">Job Satisfaction Level (1-4)</label>
                <span className="text-indigo-400 font-mono font-bold">Level {overrides.JobSatisfaction}</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={overrides.JobSatisfaction}
                onChange={(e) => handleOverrideChange('JobSatisfaction', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Base: Level 1 (Low)</span>
            </div>

            {/* Work Life Balance */}
            <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="flex justify-between text-xs">
                <label className="font-semibold text-white">Work-Life Balance Score (1-4)</label>
                <span className="text-indigo-400 font-mono font-bold">Level {overrides.WorkLifeBalance}</span>
              </div>
              <input
                type="range"
                min="1"
                max="4"
                value={overrides.WorkLifeBalance}
                onChange={(e) => handleOverrideChange('WorkLifeBalance', Number(e.target.value))}
                className="w-full accent-indigo-500 cursor-pointer"
              />
              <span className="text-[10px] text-slate-500 block">Base: Level 1 (Poor)</span>
            </div>
          </div>
        </div>

        {/* Live Simulation Impact Card */}
        <div className="glass-panel p-6 lg:col-span-6 flex flex-col justify-between border-indigo-500/30">
          <div>
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-slate-200">Simulation Delta & ROI</h3>
              <span className="text-xs bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded-full font-mono">
                Live Re-Inference
              </span>
            </div>

            {loading ? (
              <div className="py-16 text-center">
                <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin mx-auto mb-2" />
                <p className="text-xs text-slate-400">Re-evaluating decision boundary...</p>
              </div>
            ) : result ? (
              <div className="space-y-6">
                {/* Probability Delta Display */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Before Intervention</p>
                    <div className="text-3xl font-bold text-rose-400 mt-1">
                      {(result.original_probability * 100).toFixed(1)}%
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1">Baseline High Risk</p>
                  </div>

                  <div className="p-4 bg-slate-950/80 border border-indigo-500/30 rounded-xl">
                    <p className="text-xs text-slate-400 uppercase tracking-wider">After Intervention</p>
                    <div className="text-3xl font-bold text-emerald-400 mt-1">
                      {(result.new_probability * 100).toFixed(1)}%
                    </div>
                    <RiskBadge band={result.risk_band} />
                  </div>
                </div>

                {/* Net Risk Reduction Badge */}
                <div className={`p-4 rounded-xl border flex items-center gap-3 ${result.delta < 0 ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' : 'bg-rose-500/10 border-rose-500/30 text-rose-300'}`}>
                  {result.delta < 0 ? <ArrowDown className="w-6 h-6 shrink-0" /> : <ArrowUp className="w-6 h-6 shrink-0" />}
                  <div>
                    <h4 className="text-sm font-bold">
                      Net Risk Change: {(result.delta * 100).toFixed(1)}%
                    </h4>
                    <p className="text-xs opacity-90">
                      {result.delta < 0 
                        ? 'Intervention successfully lowered employee attrition risk below capacity threshold.' 
                        : 'Current overrides increased attrition probability.'}
                    </p>
                  </div>
                </div>

                {/* Business ROI Statement */}
                <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-xl space-y-2 text-xs">
                  <h4 className="font-semibold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Financial Impact & Cost Savings
                  </h4>
                  <p className="text-slate-300">
                    Retaining this employee saves an estimated <strong className="text-emerald-400 font-mono">$45,000 – $65,000</strong> in recruitment and onboarding replacement costs (6-9 months salary).
                  </p>
                </div>
              </div>
            ) : null}
          </div>

          <div className="mt-6 text-[11px] text-slate-500 text-center border-t border-slate-800/80 pt-3">
            Intervention impact computed using model partial dependence & feature weights.
          </div>
        </div>
      </div>
    </div>
  );
};
