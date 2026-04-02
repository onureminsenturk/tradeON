'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Trade } from '@/types/trade';
import { assetTypeLabels } from '@/lib/constants';
import { chartColors } from '@/config/chart-theme';

interface Props {
  trades: Trade[];
}

const RADIAN = Math.PI / 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderCustomLabel(props: any) {
  const { cx, cy, midAngle, innerRadius, outerRadius, percent } = props;
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

export default function AssetDistribution({ trades }: Props) {
  const distribution = trades.reduce((acc, t) => {
    acc[t.assetType] = (acc[t.assetType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(distribution).map(([key, value]) => ({
    name: assetTypeLabels[key as keyof typeof assetTypeLabels] || key,
    value,
  }));

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted text-sm">
        Henuz islem verisi yok.
      </div>
    );
  }

  return (
    <div className="h-72 relative">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <defs>
            {chartColors.series.map((color, i) => (
              <linearGradient key={i} id={`pieGrad${i}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={data}
            cx="50%"
            cy="45%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={4}
            dataKey="value"
            animationDuration={1000}
            animationBegin={100}
            label={renderCustomLabel}
            labelLine={false}
            stroke="rgba(0,0,0,0.2)"
            strokeWidth={1}
          >
            {data.map((_, i) => (
              <Cell key={i} fill={`url(#pieGrad${i % chartColors.series.length})`} />
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
      <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none">
        <div className="text-center">
          <p className="text-2xl font-bold text-text-primary font-tabular">{trades.length}</p>
          <p className="text-[10px] text-text-muted uppercase tracking-wider">Toplam</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1.5 justify-center mt-1">
        {data.map((item, i) => (
          <div key={i} className="flex items-center gap-1.5 text-xs text-text-secondary">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: chartColors.series[i % chartColors.series.length] }} />
            <span>{item.name}</span>
            <span className="text-text-muted font-tabular">({item.value})</span>
          </div>
        ))}
      </div>
    </div>
  );
}
