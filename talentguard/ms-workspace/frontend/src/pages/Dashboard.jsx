import React, { useState, useEffect } from 'react';
import { getDashboardOverview } from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { RiskBadge } from '../components/RiskBadge';
import { RetentionPlanModal } from '../components/RetentionPlanModal';
import { Users, AlertTriangle, UserMinus, Percent, ArrowRight, Sparkles, PieChart as PieIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboardOverview();
      setData(res);
    } catch (err) {
      console.error("Error fetching overview", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full py-24">
        <div className="w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const pieData = [
    { name: 'High Risk', value: data?.high_risk_count || 0, color: '#f43f5e' },
    { name: 'Medium Risk', value: data?.medium_risk_count || 0, color: '#f59e0b' },
    { name: 'Low Risk', value: data?.low_risk_count || 0, color: '#10b981' },
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Executive HR Overview</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time attrition monitoring for TechNova Solutions (1470 Active Workforce)
          </p>
        </div>
        <Link 
          to="/watchlist"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-colors"
        >
          View Full Top-50 Watch List <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <KpiCard 
          title="Total Workforce" 
          value={data?.total_employees || 1470} 
          subtitle="Analyzed employees"
          icon={Users}
          color="indigo"
        />
        <KpiCard 
          title="High Risk Employees" 
          value={data?.high_risk_count || 50} 
          subtitle="Probability >= 70%"
          icon={AlertTriangle}
          color="rose"
        />
        <KpiCard 
          title="Stated HR Capacity" 
          value="50 Talks / Cycle" 
          subtitle="Tied to capacity constraint"
          icon={UserMinus}
          color="amber"
        />
        <KpiCard 
          title="Baseline Attrition Rate" 
          value={`${((data?.attrition_rate || 0.161) * 100).toFixed(1)}%`} 
          subtitle="TechNova annual baseline"
          icon={Percent}
          color="emerald"
        />
      </div>

      {/* Middle Section: Chart & Department Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Pie Chart */}
        <div className="glass-panel p-5">
          <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 mb-4">
            <PieIcon className="w-4 h-4 text-indigo-400" /> Attrition Risk Distribution
          </h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center justify-center gap-6 text-xs mt-2">
            {pieData.map((item, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300 font-medium">{item.name}: {item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Department Risk Factors */}
        <div className="glass-panel p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-200 mb-4">Department Attrition Exposure (Top-50 Focus)</h3>
          <div className="space-y-4">
            {Object.entries(data?.dept_breakdown || {}).map(([dept, count], idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-slate-300">
                  <span>{dept}</span>
                  <span className="text-indigo-400">{count} Employees in Top Risk Queue</span>
                </div>
                <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-rose-500 rounded-full transition-all duration-500"
                    style={{ width: `${(count / (data?.high_risk_count || 50)) * 100}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6 p-3.5 bg-slate-950/80 border border-slate-800 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Sparkles className="w-4 h-4 text-purple-400" />
              <span>Key Insight: Sales Representatives show up to 40% attrition rate — overtime is the top driver.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Top 10 Priority Watch Table */}
      <div className="glass-panel p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Top 10 High Priority Retention Queue</h3>
            <p className="text-xs text-slate-400">Top candidates for immediate HR intervention talks</p>
          </div>
          <span className="text-xs text-indigo-400 font-mono">Precision@50 Capacity Optimized</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950/80 uppercase text-[10px] text-slate-400 border-b border-slate-800">
              <tr>
                <th className="p-3">Rank</th>
                <th className="p-3">Employee ID</th>
                <th className="p-3">Department</th>
                <th className="p-3">Job Role</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Top Risk Reason</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {data?.top_10_at_risk?.map((emp) => (
                <tr key={emp.rank} className="hover:bg-slate-800/40 transition-colors">
                  <td className="p-3 font-bold text-slate-200">#{emp.rank}</td>
                  <td className="p-3 font-mono text-indigo-300">EMP-{emp.employee_id}</td>
                  <td className="p-3">{emp.department}</td>
                  <td className="p-3 font-medium text-white">{emp.job_role}</td>
                  <td className="p-3">
                    <RiskBadge band={emp.risk_band} score={Math.round(emp.attrition_probability * 100)} />
                  </td>
                  <td className="p-3 text-slate-400">
                    {emp.top_risk_factors?.[0]?.label || 'Works Overtime'}
                  </td>
                  <td className="p-3 text-right">
                    <button
                      onClick={() => {
                        setSelectedEmployee(emp);
                        setModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-lg text-[11px] font-semibold flex items-center gap-1.5 ml-auto transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Draft AI Plan
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
