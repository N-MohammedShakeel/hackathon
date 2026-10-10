import React, { useState, useEffect } from 'react';
import { getWatchlist } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { RetentionPlanModal } from '../components/RetentionPlanModal';
import { Download, Search, Filter, Sparkles, AlertCircle, Users } from 'lucide-react';

export const WatchList = () => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { fetchList(); }, []);

  const fetchList = async () => {
    try {
      const res = await getWatchlist();
      setList(res);
      setFilteredList(res);
    } catch (err) {
      console.error('Error fetching watch list', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let result = list;
    if (searchTerm) {
      result = result.filter(emp =>
        emp.employee_id.toString().includes(searchTerm) ||
        emp.job_role.toLowerCase().includes(searchTerm.toLowerCase()) ||
        emp.department.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (deptFilter !== 'All') {
      result = result.filter(emp => emp.department === deptFilter);
    }
    setFilteredList(result);
  }, [searchTerm, deptFilter, list]);

  const exportCSV = () => {
    const headers = ['Rank', 'EmployeeID', 'AttritionProb', 'RiskBand', 'Department', 'JobRole', 'MonthlyIncome', 'OverTime', 'YearsAtCompany', 'TopRisk1', 'TopRisk2', 'TopRisk3', 'RetentionAction'];
    const rows = list.map(emp => [
      emp.rank, emp.employee_id,
      emp.attrition_probability, emp.risk_band,
      `"${emp.department}"`, `"${emp.job_role}"`,
      emp.monthly_income, emp.overtime, emp.years_at_company,
      `"${emp.top_risk_factors?.[0]?.label || ''}"`,
      `"${emp.top_risk_factors?.[1]?.label || ''}"`,
      `"${emp.top_risk_factors?.[2]?.label || ''}"`,
      `"${(emp.retention_action || '').replace(/"/g, '""')}"`,
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const a = document.createElement('a');
    a.setAttribute('href', encodeURI(csv));
    a.setAttribute('download', 'TalentGuard_Top50_Attrition_Watchlist.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const departments = ['All', ...new Set(list.map(emp => emp.department))];

  const highCount = list.filter(e => e.risk_band === 'High').length;
  const medCount  = list.filter(e => e.risk_band === 'Medium').length;

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        <div className="skeleton h-32 rounded-xl" />
        <div className="skeleton h-10 rounded-xl w-1/2" />
        <div className="skeleton h-96 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="space-y-5 fade-in">
      {/* ── Header Banner ── */}
      <div className="glass-panel p-5 border-l-4 border-l-rose-500">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[10px] bg-rose-100 text-rose-700 border border-rose-200 px-2 py-0.5 rounded font-bold font-mono uppercase tracking-wider">
                Required T4 Artifact
              </span>
              <span className="text-[10px] text-slate-400">Precision@50 Capacity Cutoff</span>
            </div>
            <h1 className="text-lg font-bold text-slate-900">Top-50 Attrition Risk Watch List</h1>
            <p className="text-xs text-slate-500 mt-1 max-w-2xl">
              Ranked by Random Forest attrition probability. Each entry shows the top SHAP risk factors
              and actionable retention interventions for immediate HR use.
            </p>

            {/* Stat pills */}
            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-50 border border-red-100 text-xs text-red-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500" /> {highCount} High Risk
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-100 text-xs text-amber-700 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {medCount} Medium Risk
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-50 border border-slate-200 text-xs text-slate-600 font-semibold">
                <Users className="w-3 h-3" /> {list.length} Total
              </div>
            </div>
          </div>

          <button
            id="btn-export-watchlist"
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm shrink-0"
          >
            <Download className="w-4 h-4" /> Export CSV Deliverable
          </button>
        </div>
      </div>

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="watchlist-search"
            type="text"
            placeholder="Search by ID, role or department…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-800 placeholder-slate-400 bg-white focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400 shrink-0" />
          <label className="text-xs text-slate-500 shrink-0">Department:</label>
          <select
            id="watchlist-dept-filter"
            value={deptFilter}
            onChange={e => setDeptFilter(e.target.value)}
            className="border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-700 bg-white focus:border-indigo-400 outline-none transition"
          >
            {departments.map((d, i) => <option key={i} value={d}>{d}</option>)}
          </select>
        </div>

        <span className="text-xs text-slate-400 ml-auto shrink-0">
          Showing {filteredList.length} of {list.length} employees
        </span>
      </div>

      {/* ── Table ── */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Rank', 'Employee ID', 'Department', 'Job Role', 'Risk Score', 'Top SHAP Risk Factors', 'Recommended Action', 'AI Coach'].map(h => (
                  <th key={h} className={`px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider ${h === 'AI Coach' ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredList.map((emp, idx) => (
                <tr key={emp.rank} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className="w-6 h-6 rounded-full bg-indigo-50 text-indigo-700 text-[10px] font-bold flex items-center justify-center">
                      {emp.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-mono text-indigo-600 font-semibold">EMP-{emp.employee_id}</td>
                  <td className="px-4 py-3 text-slate-600">{emp.department}</td>
                  <td className="px-4 py-3 text-slate-800 font-medium">{emp.job_role}</td>
                  <td className="px-4 py-3">
                    <RiskBadge band={emp.risk_band} score={Math.round(emp.attrition_probability * 100)} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {emp.top_risk_factors?.slice(0, 3).map((rf, i) => (
                        <span
                          key={i}
                          className={`px-2 py-0.5 rounded text-[10px] font-medium border ${
                            i === 0
                              ? 'bg-rose-50 text-rose-700 border-rose-100'
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}
                        >
                          {rf.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600 max-w-[180px]">
                    {emp.retention_action}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      id={`btn-ai-coach-${emp.employee_id}`}
                      onClick={() => { setSelectedEmployee(emp); setModalOpen(true); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 hover:border-indigo-400 text-indigo-600 text-[11px] font-semibold transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      AI Coach
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredList.length === 0 && (
          <div className="py-16 flex flex-col items-center gap-2 text-slate-400">
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">No employees match the current filters.</p>
          </div>
        )}
      </div>

      <RetentionPlanModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEmployee(null); }}
        employeeData={selectedEmployee}
      />
    </div>
  );
};
