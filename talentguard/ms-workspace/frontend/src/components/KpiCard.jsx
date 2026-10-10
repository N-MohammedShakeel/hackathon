import React from 'react';

export const KpiCard = ({ title, value, subtitle, icon: Icon, color = "indigo", trend }) => {
  const colorMap = {
    indigo: "from-indigo-500/20 to-purple-500/10 border-indigo-500/30 text-indigo-400",
    rose: "from-rose-500/20 to-orange-500/10 border-rose-500/30 text-rose-400",
    amber: "from-amber-500/20 to-yellow-500/10 border-amber-500/30 text-amber-400",
    emerald: "from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400"
  };

  return (
    <div className={`relative overflow-hidden rounded-xl border bg-gradient-to-br p-5 backdrop-blur-md shadow-lg ${colorMap[color] || colorMap.indigo}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-bold text-white mt-1">{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs font-medium text-slate-300">
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};
