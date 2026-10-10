import React from 'react';

export const RiskBadge = ({ band, score }) => {
  const config = {
    High:   { cls: 'badge-high',   dot: 'bg-red-500',    label: 'High' },
    Medium: { cls: 'badge-medium', dot: 'bg-amber-500',  label: 'Medium' },
    Low:    { cls: 'badge-low',    dot: 'bg-emerald-500', label: 'Low' },
  };

  const c = config[band] || config.Low;

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${c.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${c.dot} shrink-0`} />
      {c.label}{score !== undefined && ` (${score}%)`}
    </span>
  );
};
