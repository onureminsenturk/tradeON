'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '@/lib/formatters';
import { chartColors } from '@/config/chart-theme';

interface Props {
  data: { date: string; equity: number }[];
}

export default function EquityCurveChart({ data }: Props) {
  if (data.length < 2) {
    return (
      <div className="h-64 flex items-center justify-center text-text-muted text-sm">
        Henuz yeterli veri yok. Islem ekleyerek sermaye egrinizi gorun.
      </div>
    );
  }

  const isPositive = data[data.length - 1].equity >= data[0].equity;
  const color = isPositive ? chartColors.profit : chartColors.loss;

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id="equityGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
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
            tickFormatter={(val) => `${(val / 1000).toFixed(0)}k`}
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
            formatter={(value) => [formatCurrency(Number(value)), 'Bakiye']}
          />
          <Area
            type="monotone"
            dataKey="equity"
            stroke={color}
            strokeWidth={2}
            fill="url(#equityGradient)"
            animationDuration={800}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
