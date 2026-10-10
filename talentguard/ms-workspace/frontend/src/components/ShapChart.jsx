import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid } from 'recharts';

export const ShapChart = ({ factors = [] }) => {
  if (!factors || factors.length === 0) {
    return <div className="text-slate-400 text-sm py-4 text-center">No SHAP factors available.</div>;
  }

  const data = factors.map(f => ({
    name: f.label || f.feature,
    impact: f.impact,
    direction: f.direction
  })).reverse();

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart layout="vertical" data={data} margin={{ top: 0, right: 30, left: 130, bottom: 0 }} barSize={14}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: '#64748b' }}
            tickFormatter={v => `${(v * 100).toFixed(1)}%`}
            axisLine={false} tickLine={false}
          />
          <YAxis
            type="category" dataKey="name"
            tick={{ fontSize: 10, fill: '#475569' }} width={130}
            axisLine={false} tickLine={false}
          />
          <Tooltip
            contentStyle={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
            formatter={v => [`${(v * 100).toFixed(2)}% Impact`, 'SHAP Score']}
            cursor={{ fill: '#f8fafc' }}
          />
          <Bar dataKey="impact" radius={[0, 4, 4, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.direction === 'Increase Risk' ? '#dc2626' : '#16a34a'}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-4 mt-2 justify-center text-[10px]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-red-600" />
          <span className="text-slate-500">Increases Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm bg-green-600" />
          <span className="text-slate-500">Reduces Risk</span>
        </div>
      </div>
    </div>
  );
};
