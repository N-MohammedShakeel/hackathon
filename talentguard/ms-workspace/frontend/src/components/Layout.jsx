import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { 
  ShieldAlert, 
  LayoutDashboard, 
  ListFilter, 
  UserCheck, 
  SlidersHorizontal, 
  BarChart3, 
  Sparkles,
  Zap
} from 'lucide-react';

export const Layout = () => {
  const navItems = [
    { path: '/', label: 'Overview Dashboard', icon: LayoutDashboard },
    { path: '/watchlist', label: 'Top-50 Watch List', icon: ListFilter, badge: 'T4 Required' },
    { path: '/predictor', label: 'Employee Predictor', icon: UserCheck },
    { path: '/whatif', label: 'What-If Simulator', icon: SlidersHorizontal },
    { path: '/model-stats', label: 'Model Metrics', icon: BarChart3 },
  ];

  return (
    <div className="flex h-screen overflow-hidden bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 shrink-0 bg-slate-900/90 border-r border-slate-800 flex flex-col justify-between">
        <div>
          {/* Logo & Header */}
          <div className="p-5 border-b border-slate-800/80 flex items-center gap-3">
            <div className="p-2 bg-gradient-to-tr from-indigo-600 to-purple-500 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-1.5">
                TalentGuard
                <span className="text-[10px] uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-1.5 py-0.2 rounded">
                  P1 HR AI
                </span>
              </h1>
              <p className="text-[11px] text-slate-400">TechNova Retention Brain</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `
                    flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150
                    ${isActive 
                      ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 font-bold' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'}
                  `}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] bg-rose-500/20 text-rose-300 border border-rose-500/30 px-1.5 py-0.5 rounded font-mono">
                      {item.badge}
                    </span>
                  )}
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer Agent Status */}
        <div className="p-4 m-3 bg-slate-950/80 border border-slate-800/80 rounded-xl">
          <div className="flex items-center gap-2 text-xs font-semibold text-indigo-400 mb-1">
            <Sparkles className="w-4 h-4 animate-spin text-purple-400" />
            AI Retention Agent Active
          </div>
          <p className="text-[11px] text-slate-500">Gemini 1.5 Flash + SHAP Explainability Engine online</p>
          <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400">
            <span>Maverick Mini Hackathon</span>
            <span className="text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span> Live
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-slate-900/60 backdrop-blur-md border-b border-slate-800/80 px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 rounded-full text-xs font-semibold flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Capacity Stated: 50 Retention Talks / Cycle
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <span className="text-slate-400">Client: <strong className="text-slate-200">TechNova Solutions</strong></span>
            <span className="text-slate-400">Target Rate: <strong className="text-rose-400">16% Annual Attrition</strong></span>
            <div className="h-4 w-px bg-slate-800"></div>
            <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-mono">
              Render + Vercel Stack
            </span>
          </div>
        </header>

        {/* Dynamic Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
