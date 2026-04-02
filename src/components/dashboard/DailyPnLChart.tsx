'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { formatCurrency } from '@/lib/formatters';
import { chartColors } from '@/config/chart-theme';

interface Props {
  data: { date: string; pnl: number }[];
}

export default function DailyPnLChart({ data }: Props) {
  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted text-sm">
        Henuz gunluk K/Z verisi yok.
      </div>
    );
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
          <XAxis
            dataKey="date"
            tick={{ fill: chartColors.axisLabel, fontSize: 11 }}
            tickFormatter={(val) => {
              const d = new Date(val);
              return `${d.getDate()}/${d.getMonth() + 1}`;
            }}
            axisLine={{ stroke: chartColors.grid }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: chartColors.axisLabel, fontSize: 11 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: chartColors.tooltipBg,
              border: `1px solid ${chartColors.tooltipBorder}`,
              borderRadius: '8px',
              color: '#f9fafb',
            }}
            labelFormatter={(val) => new Date(val).toLocaleDateString('tr-TR')}
            formatter={(value) => [formatCurrency(Number(value)), 'K/Z']}
          />
          <Bar dataKey="pnl" radius={[4, 4, 0, 0]} animationDuration={800}>
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.pnl >= 0 ? chartColors.profit : chartColors.loss} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
