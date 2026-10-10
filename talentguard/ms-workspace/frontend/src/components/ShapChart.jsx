import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';

export const ShapChart = ({ factors = [] }) => {
  if (!factors || factors.length === 0) {
    return <div className="text-slate-500 text-sm py-4 text-center">No SHAP factors available.</div>;
  }

  const data = factors.map(f => ({
    name: f.label || f.feature,
    impact: f.impact,
    direction: f.direction
  })).reverse();

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <XAxis type="number" stroke="#64748b" tickFormatter={(v) => `${(v * 100).toFixed(1)}%`} />
          <YAxis type="category" dataKey="name" stroke="#94a3b8" width={130} tick={{ fontSize: 12 }} />
          <Tooltip 
            contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '0.5rem', color: '#f8fafc' }}
            formatter={(value) => [`${(value * 100).toFixed(2)}% Impact`, 'SHAP Score']}
          />
          <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.direction === 'Increase Risk' ? '#f43f5e' : '#3b82f6'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
