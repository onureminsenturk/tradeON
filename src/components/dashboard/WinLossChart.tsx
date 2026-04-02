'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trade } from '@/types/trade';
import { getClosedTrades } from '@/lib/calculations';
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

export default function WinLossChart({ trades }: Props) {
  const closed = getClosedTrades(trades);
  const wins = closed.filter(t => (t.pnl ?? 0) > 0).length;
  const losses = closed.filter(t => (t.pnl ?? 0) < 0).length;
  const breakeven = closed.filter(t => (t.pnl ?? 0) === 0).length;

  const data = [
    { name: 'Kazanc', value: wins, color: chartColors.profit },
    { name: 'Kayip', value: losses, color: chartColors.loss },
    ...(breakeven > 0 ? [{ name: 'Basabas', value: breakeven, color: chartColors.neutral }] : []),
  ].filter(d => d.value > 0);

  if (data.length === 0) {
    return (
      <div className="h-52 flex items-center justify-center text-text-muted text-sm">
        Henuz kapanmis islem yok.
      </div>
    );
  }

  const winRate = closed.length > 0 ? ((wins / closed.length) * 100).toFixed(1) : '0';

  return (
    <div className="h-52 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            <linearGradient id="winGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
              <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
            </linearGradient>
            <linearGradient id="lossGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#ef4444" stopOpacity={1} />
              <stop offset="100%" stopColor="#dc2626" stopOpacity={0.8} />
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
              <Cell
                key={i}
                fill={entry.name === 'Kazanc' ? 'url(#winGrad)' : entry.name === 'Kayip' ? 'url(#lossGrad)' : chartColors.neutral}
              />
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
          <p className={`text-xl font-bold font-tabular ${parseFloat(winRate) >= 50 ? 'text-profit' : 'text-loss'}`}>
            %{winRate}
          </p>
          <p className="text-[9px] text-text-muted uppercase tracking-wider">Basari</p>
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
