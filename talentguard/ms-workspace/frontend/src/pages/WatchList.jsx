import React, { useState, useEffect } from 'react';
import { getWatchlist } from '../services/api';
import { RiskBadge } from '../components/RiskBadge';
import { RetentionPlanModal } from '../components/RetentionPlanModal';
import { Download, Search, Filter, Sparkles, AlertCircle } from 'lucide-react';

export const WatchList = () => {
  const [list, setList] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All');
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    try {
      const res = await getWatchlist();
      setList(res);
      setFilteredList(res);
    } catch (err) {
      console.error("Error fetching watch list", err);
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
    const headers = ["Rank", "EmployeeID", "AttritionProbability", "RiskBand", "Department", "JobRole", "MonthlyIncome", "OverTime", "YearsAtCompany", "TopRisk1", "TopRisk2", "TopRisk3", "RetentionAction"];
    
    const rows = list.map(emp => [
      emp.rank,
      emp.employee_id,
      emp.attrition_probability,
      emp.risk_band,
      `"${emp.department}"`,
      `"${emp.job_role}"`,
      emp.monthly_income,
      emp.overtime,
      emp.years_at_company,
      `"${emp.top_risk_factors?.[0]?.label || ''}"`,
      `"${emp.top_risk_factors?.[1]?.label || ''}"`,
      `"${emp.top_risk_factors?.[2]?.label || ''}"`,
      `"${emp.retention_action.replace(/"/g, '""')}"`
    ]);

    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "TalentGuard_Top50_Attrition_Watchlist.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const departments = ['All', ...new Set(list.map(emp => emp.department))];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="glass-panel p-6 border-indigo-500/30 bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-rose-500/20 text-rose-300 border border-rose-500/30 rounded text-xs font-bold font-mono">
                REQUIRED T4 ARTIFACT
              </span>
              <span className="text-xs text-slate-400">Precision@50 Capacity Cutoff</span>
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
              Top-50 Attrition Risk Watch List
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Ranked list of employees highest at risk of resigning next cycle, generated via Random Forest + SHAP Explainability. Each entry details the top 3 risk factors and actionable retention interventions.
            </p>
          </div>

          <button
            onClick={exportCSV}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all shrink-0"
          >
            <Download className="w-4 h-4" /> Download Official CSV Deliverable
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
          <input
            type="text"
            placeholder="Search ID, role, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400">Department:</span>
          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          >
            {departments.map((dept, i) => (
              <option key={i} value={dept}>{dept}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Watch List Table */}
      <div className="glass-panel overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3.5">Rank</th>
                <th className="p-3.5">Emp ID</th>
                <th className="p-3.5">Department</th>
                <th className="p-3.5">Job Role</th>
                <th className="p-3.5">Risk Score</th>
                <th className="p-3.5">Top 3 SHAP Risk Factors</th>
                <th className="p-3.5">Recommended Retention Action</th>
                <th className="p-3.5 text-right">Agentic AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredList.map((emp) => (
                <tr key={emp.rank} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3.5 font-bold text-white">#{emp.rank}</td>
                  <td className="p-3.5 font-mono text-indigo-300">EMP-{emp.employee_id}</td>
                  <td className="p-3.5">{emp.department}</td>
                  <td className="p-3.5 font-medium text-slate-200">{emp.job_role}</td>
                  <td className="p-3.5">
                    <RiskBadge band={emp.risk_band} score={Math.round(emp.attrition_probability * 100)} />
                  </td>
                  <td className="p-3.5">
                    <div className="flex flex-wrap gap-1 max-w-xs">
                      {emp.top_risk_factors?.map((rf, idx) => (
                        <span key={idx} className="bg-slate-800 text-slate-300 border border-slate-700/60 px-1.5 py-0.5 rounded text-[10px]">
                          {rf.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="p-3.5 max-w-xs text-slate-300 font-medium">
                    {emp.retention_action}
                  </td>
                  <td className="p-3.5 text-right">
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setModalOpen(true);
                      }}
                      className="px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ml-auto transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> AI Coach
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* AI Retention Plan Modal */}
      <RetentionPlanModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        employeeData={selectedEmployee}
      />
    </div>
  );
};
