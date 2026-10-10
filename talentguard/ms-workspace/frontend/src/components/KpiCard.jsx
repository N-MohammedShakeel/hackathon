import React from 'react';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

const colorTokens = {
  indigo: {
    icon: 'bg-indigo-50 text-indigo-600',
    accent: 'border-l-indigo-500',
    value: 'text-indigo-700',
    dot: 'bg-indigo-500',
  },
  rose: {
    icon: 'bg-rose-50 text-rose-600',
    accent: 'border-l-rose-500',
    value: 'text-rose-700',
    dot: 'bg-rose-500',
  },
  amber: {
    icon: 'bg-amber-50 text-amber-600',
    accent: 'border-l-amber-500',
    value: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  emerald: {
    icon: 'bg-emerald-50 text-emerald-600',
    accent: 'border-l-emerald-500',
    value: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
};

export const KpiCard = ({ title, value, subtitle, icon: Icon, color = 'indigo', trend, trendDir }) => {
  const t = colorTokens[color] || colorTokens.indigo;
  const TrendIcon = trendDir === 'up' ? TrendingUp : trendDir === 'down' ? TrendingDown : Minus;
  const trendColor = trendDir === 'up' ? 'text-rose-500' : trendDir === 'down' ? 'text-emerald-500' : 'text-slate-400';

  return (
    <div className={`glass-panel p-5 border-l-4 ${t.accent} fade-in`}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className={`text-2xl font-bold mt-1.5 ${t.value}`}>{value}</h3>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-2.5 rounded-xl ${t.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      {trend && (
        <div className={`mt-3 flex items-center gap-1 text-xs font-medium ${trendColor}`}>
          <TrendIcon className="w-3.5 h-3.5" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
};
