import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  ShieldCheck, 
  LayoutDashboard, 
  ListFilter, 
  UserCheck, 
  SlidersHorizontal, 
  BarChart3, 
  MessageSquare,
  Zap,
  ChevronRight,
  Bell,
  HelpCircle
} from 'lucide-react';

export const Layout = () => {
  const [chatOpen, setChatOpen] = useState(false);

  const navItems = [
    { path: '/', label: 'Overview', sublabel: 'Executive Dashboard', icon: LayoutDashboard },
    { path: '/watchlist', label: 'Watch List', sublabel: 'Top-50 At-Risk', icon: ListFilter, badge: 'T4' },
    { path: '/predictor', label: 'Predictor', sublabel: 'Single Employee', icon: UserCheck },
    { path: '/whatif', label: 'What-If', sublabel: 'Scenario Simulator', icon: SlidersHorizontal },
    { path: '/model-stats', label: 'Model Metrics', sublabel: 'RF Performance', icon: BarChart3 },
    { path: '/chat', label: 'AI Assistant', sublabel: 'Ask about employees', icon: MessageSquare, highlight: true },
  ];

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#f1f5f9' }}>
      {/* ── Sidebar ── */}
      <aside className="w-60 shrink-0 flex flex-col sidebar" style={{ zIndex: 20 }}>
        {/* Logo */}
        <div className="px-5 py-5 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md" 
                 style={{ background: 'linear-gradient(135deg, #6366f1, #818cf8)' }}>
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-900 tracking-tight">TalentGuard</h1>
              <p className="text-[10px] text-slate-400 font-medium">HR Intelligence Platform</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest px-3 mb-2">Navigation</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === '/'}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 group ${
                    isActive
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-100'
                      : item.highlight
                      ? 'text-indigo-600 hover:bg-indigo-50'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 shrink-0" />
                  <div>
                    <div className="leading-tight">{item.label}</div>
                    <div className="text-[10px] text-slate-400 font-normal leading-tight">{item.sublabel}</div>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  {item.badge && (
                    <span className="text-[9px] bg-rose-100 text-rose-600 border border-rose-200 px-1.5 py-0.5 rounded font-bold font-mono">
                      {item.badge}
                    </span>
                  )}
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 group-hover:text-slate-400" />
                </div>
              </NavLink>
            );
          })}
        </nav>

        {/* Sidebar Footer */}
        <div className="px-4 pb-5 space-y-3">
          {/* Live Status */}
          <div className="p-3 rounded-xl border border-slate-100 bg-white">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="text-xs font-semibold text-slate-700">AI System Online</span>
            </div>
            <p className="text-[10px] text-slate-400 leading-relaxed">Gemini 1.5 Flash + RF Model Active</p>
          </div>

          {/* Context */}
          <div className="px-1">
            <p className="text-[10px] text-slate-400 font-medium">Maverick Hackathon · TechNova Solutions</p>
            <p className="text-[10px] text-slate-400">1,470 Workforce · Random Forest ML</p>
          </div>
        </div>
      </aside>

      {/* ── Main Area ── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-14 bg-white border-b border-slate-100 px-6 flex items-center justify-between shrink-0" style={{ zIndex: 10 }}>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-indigo-100 bg-indigo-50">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-xs font-semibold text-indigo-700">Capacity: 50 Retention Talks / Cycle</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-xs text-slate-500">
              Client: <strong className="text-slate-800">TechNova Solutions</strong>
            </span>
            <span className="text-xs text-slate-500">
              Target: <strong className="text-rose-600">↓ 16% Annual Attrition</strong>
            </span>
            <div className="h-4 w-px bg-slate-200" />
            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <Bell className="w-4 h-4" />
            </button>
            <button className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-lg transition-colors">
              <HelpCircle className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
