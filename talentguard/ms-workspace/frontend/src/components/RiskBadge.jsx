import React from 'react';

export const RiskBadge = ({ band, score }) => {
  let badgeClass = "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
  let dotClass = "bg-emerald-400";

  if (band === 'High' || (score && score >= 70)) {
    badgeClass = "bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse";
    dotClass = "bg-rose-500";
  } else if (band === 'Medium' || (score && score >= 40)) {
    badgeClass = "bg-amber-500/10 text-amber-400 border-amber-500/20";
    dotClass = "bg-amber-400";
  }

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`}></span>
      {band || (score ? `${score}% Risk` : 'Unknown')}
      {score !== undefined && band && ` (${score}%)`}
    </span>
  );
};
