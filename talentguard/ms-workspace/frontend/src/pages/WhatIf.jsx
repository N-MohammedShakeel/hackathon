import React, { useState } from 'react';
import { predictWhatIf } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { SlidersHorizontal, ArrowDown, ArrowUp, RefreshCw, CheckCircle2, TrendingDown } from 'lucide-react';

const BASE_EMPLOYEE = {
  Age: 29, BusinessTravel: 'Travel_Frequently', DailyRate: 500,
  Department: 'Sales', DistanceFromHome: 25, Education: 2,
  EducationField: 'Life Sciences', EnvironmentSatisfaction: 1,
  Gender: 'Female', HourlyRate: 45, JobInvolvement: 1, JobLevel: 1,
  JobRole: 'Sales Representative', JobSatisfaction: 1, MaritalStatus: 'Single',
  MonthlyIncome: 2200, MonthlyRate: 12000, NumCompaniesWorked: 5,
  OverTime: 'Yes', PercentSalaryHike: 12, PerformanceRating: 3,
  RelationshipSatisfaction: 1, StockOptionLevel: 0, TotalWorkingYears: 3,
  TrainingTimesLastYear: 2, WorkLifeBalance: 1, YearsAtCompany: 1,
  YearsInCurrentRole: 1, YearsSinceLastPromotion: 0, YearsWithCurrManager: 1,
};

export const WhatIf = () => {
  const [overrides, setOverrides] = useState({
    OverTime: 'No',
    MonthlyIncome: 3500,
    JobSatisfaction: 3,
    WorkLifeBalance: 3,
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (field, value) => {
    const next = { ...overrides, [field]: value };
    setOverrides(next);
    runSimulation(next);
  };

  const runSimulation = async (o = overrides) => {
    setLoading(true);
    try {
      const res = await predictWhatIf(BASE_EMPLOYEE, o);
      setResult(res);
    } catch (err) {
      console.error('Simulation error', err);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => { runSimulation(); }, []);

  const ControlCard = ({ label, baseline, children }) => (
    <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-800">{label}</p>
          <p className="text-[10px] text-slate-400 mt-0.5">Baseline: {baseline}</p>
        </div>
      </div>
      {children}
    </div>
  );

  return (
    <div className="space-y-5 fade-in">
      {/* ── Header ── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <SlidersHorizontal className="w-5 h-5 text-indigo-600" />
          What-If Retention Simulator
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Simulate HR policy interventions and observe real-time impact on attrition risk.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* ── Controls ── */}
        <div className="glass-panel p-5 lg:col-span-6 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800 border-b border-slate-100 pb-3 flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-indigo-500" />
            HR Policy Intervention Handles
          </h3>

          {/* Overtime */}
          <ControlCard label="Overtime Policy" baseline="Works Overtime (Yes)">
            <div className="flex items-center gap-3">
              {['No', 'Yes'].map(val => (
                <button
                  key={val}
                  onClick={() => handleChange('OverTime', val)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    overrides.OverTime === val
                      ? val === 'No'
                        ? 'bg-emerald-600 border-emerald-600 text-white'
                        : 'bg-rose-600 border-rose-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                  }`}
                >
                  {val === 'No' ? '✓ Eliminate Overtime' : '✗ Keep Overtime'}
                </button>
              ))}
            </div>
          </ControlCard>

          {/* Salary Slider */}
          <ControlCard label="Monthly Income ($)" baseline="$2,200 (low benchmark)">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-slate-500">$2,000</span>
              <span className="font-bold text-indigo-600 font-mono">${overrides.MonthlyIncome.toLocaleString()}</span>
              <span className="text-slate-500">$8,000</span>
            </div>
            <input
              type="range" min="2000" max="8000" step="100"
              value={overrides.MonthlyIncome}
              onChange={e => handleChange('MonthlyIncome', Number(e.target.value))}
              className="w-full accent-indigo-500 cursor-pointer"
            />
            <p className="text-[10px] text-slate-400">
              Increase: +${(overrides.MonthlyIncome - 2200).toLocaleString()} above baseline
            </p>
          </ControlCard>

          {/* Job Satisfaction */}
          <ControlCard label="Job Satisfaction Level (1–4)" baseline="Level 1 (Low)">
            <div className="flex gap-2">
              {[1,2,3,4].map(level => (
                <button
                  key={level}
                  onClick={() => handleChange('JobSatisfaction', level)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    overrides.JobSatisfaction === level
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>Low</span><span>Medium</span><span>High</span><span>Very High</span>
            </div>
          </ControlCard>

          {/* Work-Life Balance */}
          <ControlCard label="Work-Life Balance Score (1–4)" baseline="Level 1 (Poor)">
            <div className="flex gap-2">
              {[1,2,3,4].map(level => (
                <button
                  key={level}
                  onClick={() => handleChange('WorkLifeBalance', level)}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
                    overrides.WorkLifeBalance === level
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'bg-white border-slate-200 text-slate-600 hover:border-indigo-300'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </ControlCard>
        </div>

        {/* ── Result Panel ── */}
        <div className="glass-panel p-5 lg:col-span-6 flex flex-col">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Live Simulation Result</h3>
            <span className={`text-[10px] font-mono px-2 py-1 rounded-full border ${loading ? 'bg-amber-50 text-amber-600 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
              {loading ? 'Computing…' : 'Live Re-Inference'}
            </span>
          </div>

          {loading && !result ? (
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
            </div>
          ) : result ? (
            <div className="space-y-4 flex-1">
              {/* Before / After */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-100">
                  <p className="text-[10px] text-rose-600 uppercase font-semibold mb-1">Before</p>
                  <div className="text-2xl font-extrabold text-rose-700">
                    {(result.original_probability * 100).toFixed(1)}%
                  </div>
                  <p className="text-[10px] text-rose-500 mt-0.5">High Baseline Risk</p>
                </div>
                <div className={`p-4 rounded-xl border ${result.improved ? 'bg-emerald-50 border-emerald-100' : 'bg-amber-50 border-amber-100'}`}>
                  <p className={`text-[10px] uppercase font-semibold mb-1 ${result.improved ? 'text-emerald-600' : 'text-amber-600'}`}>After</p>
                  <div className={`text-2xl font-extrabold ${result.improved ? 'text-emerald-700' : 'text-amber-700'}`}>
                    {(result.new_probability * 100).toFixed(1)}%
                  </div>
                  <div className="mt-1">
                    <RiskBadge band={result.risk_band} />
                  </div>
                </div>
              </div>

              {/* Delta Banner */}
              <div className={`p-3.5 rounded-xl border flex items-center gap-3 ${result.delta < 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
                {result.delta < 0
                  ? <ArrowDown className="w-5 h-5 text-emerald-600 shrink-0" />
                  : <ArrowUp className="w-5 h-5 text-rose-600 shrink-0" />
                }
                <div>
                  <p className={`text-sm font-bold ${result.delta < 0 ? 'text-emerald-800' : 'text-rose-800'}`}>
                    Net Risk Change: {result.delta > 0 ? '+' : ''}{(result.delta * 100).toFixed(1)}%
                  </p>
                  <p className={`text-xs mt-0.5 ${result.delta < 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {result.delta < 0
                      ? 'Interventions successfully reduced employee attrition risk.'
                      : 'Current overrides increased attrition probability.'}
                  </p>
                </div>
              </div>

              {/* Savings */}
              <div className="p-4 rounded-xl border border-slate-200 bg-white space-y-2">
                <h4 className="text-xs font-semibold text-slate-800 flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  Estimated Retention Value
                </h4>
                <p className="text-xs text-slate-600">
                  Retaining this employee saves an estimated{' '}
                  <strong className="text-emerald-700 font-mono">$45,000 – $65,000</strong> in recruitment and onboarding
                  replacement costs (approx. 6–9 months salary).
                </p>
              </div>

              <p className="text-[10px] text-slate-400 text-center">
                Impact computed using model partial dependence & feature weights.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};
