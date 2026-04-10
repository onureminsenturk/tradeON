'use client';

import { useState, useMemo } from 'react';
import { useTrades } from '@/context/TradeContext';
import { useAuth } from '@/context/AuthContext';
import { groupTradesByPeriod, calculatePerformanceMetrics, calculateDailyReturns } from '@/lib/calculations';
import { formatCurrency } from '@/lib/formatters';
import { PeriodType } from '@/types/performance';
import {
  LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer, Cell, ReferenceLine
} from 'recharts';
import { chartColors } from '@/config/chart-theme';

const periodTabs: { key: PeriodType; label: string }[] = [
  { key: 'gunluk', label: 'Gunluk' },
  { key: 'haftalik', label: 'Haftalik' },
  { key: 'aylik', label: 'Aylik' },
  { key: 'yillik', label: 'Yillik' },
];

const tooltipStyle = {
  backgroundColor: chartColors.tooltipBg,
  border: `1px solid ${chartColors.tooltipBorder}`,
  borderRadius: '8px',
  color: '#f9fafb',
};

export default function PerformancePage() {
  const { filteredTrades: trades } = useTrades();
  const { user } = useAuth();
  const [period, setPeriod] = useState<PeriodType>('aylik');

  const startingBalance = user?.settings.startingBalance || 10000;
  const metrics = useMemo(() => calculatePerformanceMetrics(trades, startingBalance), [trades, startingBalance]);
  const periodSummaries = useMemo(() => groupTradesByPeriod(trades, period), [trades, period]);

  // Cumulative PnL data
  const cumulativeData = useMemo(() => {
    let cum = 0;
    return periodSummaries.map(s => {
      cum += s.netPnL;
      return { period: s.periodKey, label: s.periodLabel, pnl: s.netPnL, cumulative: cum };
    });
  }, [periodSummaries]);

  // Monthly heatmap (daily returns)
  const dailyReturns = useMemo(() => calculateDailyReturns(trades), [trades]);

  // Trade P&L distribution histogram
  const distribution = useMemo(() => {
    const pnls = trades.filter(t => t.pnl !== null).map(t => t.pnl!);
    if (pnls.length === 0) return [];
    const min = Math.min(...pnls);
    const max = Math.max(...pnls);
    const range = max - min || 1;
    const bucketCount = 12;
    const bucketSize = range / bucketCount;
    const buckets: { range: string; count: number; midpoint: number }[] = [];

    for (let i = 0; i < bucketCount; i++) {
      const low = min + i * bucketSize;
      const high = low + bucketSize;
      const count = pnls.filter(p => p >= low && (i === bucketCount - 1 ? p <= high : p < high)).length;
      buckets.push({
        range: `${low.toFixed(0)}`,
        count,
        midpoint: (low + high) / 2,
      });
    }
    return buckets;
  }, [trades]);

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Performans Analizi</h1>

      {/* Period Tabs */}
      <div className="flex gap-2 bg-bg-secondary rounded-lg p-1 w-fit">
        {periodTabs.map(tab => (
          <button
            key={tab.key}
            onClick={() => setPeriod(tab.key)}
            className={`px-4 py-2 text-sm rounded-md transition-all ${
              period === tab.key
                ? 'bg-accent-primary text-bg-primary font-semibold'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Toplam K/Z', value: formatCurrency(metrics.totalPnL), positive: metrics.totalPnL >= 0 },
          { label: 'Basari Orani', value: `%${metrics.winRate.toFixed(1)}`, positive: metrics.winRate >= 50 },
          { label: 'Sharpe Orani', value: metrics.sharpeRatio.toFixed(2), positive: metrics.sharpeRatio > 0 },
          { label: 'Max Dusus', value: `%${metrics.maxDrawdownPercent.toFixed(1)}`, positive: false },
        ].map((kpi, i) => (
          <div key={i} className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-4">
            <p className="text-xs text-text-muted mb-1">{kpi.label}</p>
            <p className={`text-xl font-bold font-tabular ${kpi.positive ? 'text-profit' : 'text-loss'}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Cumulative PnL Chart */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Kumulatif K/Z</h3>
        <div className="h-72">
          {cumulativeData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cumulativeData}>
                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                <XAxis dataKey="period" tick={{ fill: chartColors.axisLabel, fontSize: 11 }} tickLine={false} />
                <YAxis tick={{ fill: chartColors.axisLabel, fontSize: 11 }} tickLine={false} axisLine={false} />
                <ReferenceLine y={0} stroke={chartColors.neutral} strokeDasharray="3 3" />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => [formatCurrency(Number(v)), 'Kumulatif']} />
                <Line type="monotone" dataKey="cumulative" stroke="#06b6d4" strokeWidth={2.5} dot={{ fill: '#06b6d4', r: 3 }} animationDuration={800} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-text-muted text-sm">Veri yok</div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Drawdown */}
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Dusus Analizi (Drawdown)</h3>
          <div className="h-56">
            {metrics.drawdownSeries.length > 1 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={metrics.drawdownSeries}>
                  <defs>
                    <linearGradient id="ddGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="date" tick={{ fill: chartColors.axisLabel, fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fill: chartColors.axisLabel, fontSize: 10 }} tickLine={false} axisLine={false} reversed />
                  <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`%${Number(v).toFixed(2)}`, 'Dusus']} />
                  <Area type="monotone" dataKey="drawdownPercent" stroke="#ef4444" fill="url(#ddGrad)" animationDuration={800} />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm">Veri yok</div>
            )}
          </div>
        </div>

        {/* Distribution Histogram */}
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">K/Z Dagilimi</h3>
          <div className="h-56">
            {distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                  <XAxis dataKey="range" tick={{ fill: chartColors.axisLabel, fontSize: 10 }} tickLine={false} />
                  <YAxis tick={{ fill: chartColors.axisLabel, fontSize: 10 }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="count" radius={[3, 3, 0, 0]} animationDuration={800}>
                    {distribution.map((entry, i) => (
                      <Cell key={i} fill={entry.midpoint >= 0 ? chartColors.profit : chartColors.loss} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-text-muted text-sm">Veri yok</div>
            )}
          </div>
        </div>
      </div>

      {/* Period Table */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl overflow-hidden">
        <div className="p-5 border-b border-bg-quaternary/50">
          <h3 className="text-sm font-semibold text-text-primary">Donem Bazli Performans</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bg-quaternary/30">
                {['Donem', 'Islem', 'Kazanc', 'Kayip', 'Basari %', 'Net K/Z', 'Profit F.', 'En Iyi', 'En Kotu'].map(h => (
                  <th key={h} className="text-left text-xs font-medium text-text-muted px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {periodSummaries.length === 0 ? (
                <tr><td colSpan={9} className="text-center text-text-muted py-8 text-sm">Veri yok</td></tr>
              ) : (
                periodSummaries.map(s => (
                  <tr key={s.periodKey} className="border-b border-bg-quaternary/20 hover:bg-bg-tertiary/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-text-primary">{s.periodLabel}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary font-tabular">{s.totalTrades}</td>
                    <td className="px-4 py-3 text-sm text-profit font-tabular">{s.winningTrades}</td>
                    <td className="px-4 py-3 text-sm text-loss font-tabular">{s.losingTrades}</td>
                    <td className="px-4 py-3 text-sm font-tabular">
                      <span className={s.winRate >= 50 ? 'text-profit' : 'text-loss'}>%{s.winRate.toFixed(0)}</span>
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold font-tabular ${s.netPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {s.netPnL >= 0 ? '+' : ''}{formatCurrency(s.netPnL)}
                    </td>
                    <td className="px-4 py-3 text-sm text-text-secondary font-tabular">
                      {s.profitFactor === Infinity ? '∞' : s.profitFactor.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm text-profit font-tabular">
                      {s.largestWin > 0 ? `+${formatCurrency(s.largestWin)}` : '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-loss font-tabular">
                      {s.largestLoss < 0 ? formatCurrency(s.largestLoss) : '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Monthly Heatmap */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Aylik Isı Haritasi</h3>
        {dailyReturns.length > 0 ? (
          <div className="grid grid-cols-7 gap-1.5">
            {['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
              <div key={d} className="text-center text-[10px] text-text-muted py-1">{d}</div>
            ))}
            {dailyReturns.slice(-35).map((d, i) => {
              const intensity = Math.min(Math.abs(d.pnl) / 500, 1);
              const bg = d.pnl > 0
                ? `rgba(16, 185, 129, ${0.15 + intensity * 0.6})`
                : d.pnl < 0
                ? `rgba(239, 68, 68, ${0.15 + intensity * 0.6})`
                : 'rgba(107, 114, 128, 0.1)';
              return (
                <div
                  key={i}
                  className="aspect-square rounded-sm flex items-center justify-center text-[9px] font-tabular text-text-primary/80"
                  style={{ backgroundColor: bg }}
                  title={`${d.date}: ${formatCurrency(d.pnl)}`}
                >
                  {new Date(d.date).getDate()}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center text-text-muted text-sm py-8">Veri yok</div>
        )}
      </div>
    </div>
  );
}
