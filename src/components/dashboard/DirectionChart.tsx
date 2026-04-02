'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trade } from '@/types/trade';
import { chartColors } from '@/config/chart-theme';

interface Props {
  trades: Trade[];
}

const RADIAN = Math.PI / 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderCustomLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (percent < 0.03) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function DirectionChart({ trades }: Props) {
  const longs = trades.filter(t => t.direction === 'long').length;
  const shorts = trades.filter(t => t.direction === 'short').length;

  const data = [
    { name: 'Long', value: longs, color: '#06b6d4' },
    { name: 'Short', value: shorts, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-52 flex items-center justify-center text-text-muted text-sm">
        Henuz islem yok.
      </div>
    );
  }

  return (
    <div className="h-52 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="longGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity={1} />
              <stop offset="100%" stopColor="#0891b2" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="shortGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" stopOpacity={1} />
              <stop offset="100%" stopColor="#7c3aed" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={45}
            outerRadius={70}
            paddingAngle={3}
            dataKey="value"
            animationDuration={1000}
            label={renderCustomLabel}
            labelLine={false}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth={1}
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.name === 'Long' ? 'url(#longGrad)' : 'url(#shortGrad)'} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: chartColors.tooltipBg,
              border: `1px solid ${chartColors.tooltipBorder}`,
              borderRadius: '10px',
              color: '#f9fafb',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
            }}
            formatter={(value) => [`${value} islem`, 'Adet']}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center">
          <p className="text-lg font-bold text-text-primary font-tabular">{trades.length}</p>
          <p className="text-[9px] text-text-muted uppercase tracking-wider">Islem</p>
        </div>
      </div>
      <div className="flex gap-4 justify-center -mt-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-text-secondary">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
            <span>{item.name}</span>
            <span className="text-text-muted font-tabular font-semibold">{item.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
