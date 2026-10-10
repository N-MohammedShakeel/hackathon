import React, { useState, useEffect } from 'react';
import { getDashboardOverview } from '../services/api';
import { KpiCard } from '../components/KpiCard';
import { RiskBadge } from '../components/RiskBadge';
import { RetentionPlanModal } from '../components/RetentionPlanModal';
import {
  Users, AlertTriangle, UserCheck, TrendingDown,
  ArrowRight, Sparkles, Activity
} from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Link } from 'react-router-dom';

const PIE_COLORS = { High: '#dc2626', Medium: '#d97706', Low: '#16a34a' };

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-lg px-3 py-2 shadow-lg text-xs">
        <strong className="text-slate-800">{payload[0].name}</strong>
        <div className="text-slate-500 mt-0.5">{payload[0].value} employees</div>
      </div>
    );
  }
  return null;
};

export const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => { fetchDashboard(); }, []);

  const fetchDashboard = async () => {
    try {
      const res = await getDashboardOverview();
      setData(res);
    } catch (err) {
      console.error('Error fetching overview', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-xl" />)}
        </div>
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton h-72 rounded-xl" />
      </div>
    );
  }

  const pieData = [
    { name: 'High Risk',   value: data?.high_risk_count   || 0 },
    { name: 'Medium Risk', value: data?.medium_risk_count || 0 },
    { name: 'Low Risk',    value: data?.low_risk_count    || 0 },
  ];

  const deptBarData = Object.entries(data?.dept_breakdown || {}).map(([dept, count]) => ({
    name: dept, count,
  }));

  return (
    <div className="space-y-6 fade-in">
      {/* ── Page header ── */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Executive HR Overview</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Real-time attrition analytics · TechNova Solutions · 1,470 active employees
          </p>
        </div>
        <Link
          to="/watchlist"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors shadow-sm"
        >
          Full Watch List <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          title="Total Workforce"
          value={(data?.total_employees || 1470).toLocaleString()}
          subtitle="Analyzed via Random Forest"
          icon={Users}
          color="indigo"
        />
        <KpiCard
          title="High Risk Employees"
          value={data?.high_risk_count || 50}
          subtitle="Risk score ≥ 70%"
          icon={AlertTriangle}
          color="rose"
          trend="Immediate HR action required"
          trendDir="up"
        />
        <KpiCard
          title="HR Capacity"
          value="50 Talks / Cycle"
          subtitle="Precision@50 constraint"
          icon={UserCheck}
          color="amber"
        />
        <KpiCard
          title="Baseline Attrition"
          value={`${((data?.attrition_rate || 0.161) * 100).toFixed(1)}%`}
          subtitle="TechNova annual rate"
          icon={TrendingDown}
          color="emerald"
          trend="Target: reduce below 12%"
          trendDir="down"
        />
      </div>

      {/* ── Charts row ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Pie chart */}
        <div className="glass-panel p-5 lg:col-span-2">
          <div className="flex items-center gap-2 mb-1">
            <Activity className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-slate-800">Risk Distribution</h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">Top-50 watchlist breakdown by band</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry) => (
                    <Cell key={entry.name} fill={PIE_COLORS[entry.name.split(' ')[0]]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="flex flex-col gap-2 mt-2">
            {pieData.map((item) => (
              <div key={item.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-sm"
                    style={{ backgroundColor: PIE_COLORS[item.name.split(' ')[0]] }}
                  />
                  <span className="text-slate-600 font-medium">{item.name}</span>
                </div>
                <span className="font-bold text-slate-800">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Dept bar chart */}
        <div className="glass-panel p-5 lg:col-span-3">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Department Exposure</h3>
          <p className="text-xs text-slate-400 mb-4">Employees in top-50 risk queue by department</p>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deptBarData} barSize={28}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 10, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  cursor={{ fill: '#f8fafc' }}
                  contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} name="At-Risk Employees" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Insight chip */}
          <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-indigo-50 border border-indigo-100">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
            <p className="text-xs text-indigo-700 font-medium">
              Sales Representatives show the highest attrition risk — overtime is the top driver.
            </p>
          </div>
        </div>
      </div>

      {/* ── Top 10 Table ── */}
      <div className="glass-panel overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Top 10 Priority Retention Queue</h3>
            <p className="text-xs text-slate-400 mt-0.5">Candidates for immediate HR intervention talks</p>
          </div>
          <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-1 rounded-full">
            Precision@50 Optimised
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {['Rank', 'Employee', 'Department', 'Job Role', 'Risk Level', 'Top Risk Reason', 'Action'].map(h => (
                  <th key={h} className={`px-4 py-3 text-[10px] font-semibold text-slate-500 uppercase tracking-wider ${h === 'Action' ? 'text-right' : ''}`}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {data?.top_10_at_risk?.map((emp, idx) => (
                <tr
                  key={emp.rank}
                  className="hover:bg-slate-50 transition-colors group"
                  style={{ animationDelay: `${idx * 30}ms` }}
                >
                  <td className="px-4 py-3">
                    <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center">
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
                    <span className="inline-block bg-rose-50 text-rose-700 border border-rose-100 px-2 py-0.5 rounded text-[10px] font-medium">
                      {emp.top_risk_factors?.[0]?.label || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      id={`btn-draft-plan-emp-${emp.employee_id}`}
                      onClick={() => { setSelectedEmployee(emp); setModalOpen(true); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 bg-white hover:bg-indigo-50 hover:border-indigo-400 text-indigo-600 text-[11px] font-semibold transition-all"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      Draft AI Plan
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <RetentionPlanModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setSelectedEmployee(null); }}
        employeeData={selectedEmployee}
      />
    </div>
  );
};
