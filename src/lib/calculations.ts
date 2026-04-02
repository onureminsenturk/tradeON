import { Trade } from '@/types/trade';
import { PeriodSummary, PerformanceMetrics } from '@/types/performance';

export function calculateTradePnL(trade: Trade): { pnl: number; pnlPercent: number } {
  if (!trade.exitPrice) return { pnl: 0, pnlPercent: 0 };

  const multiplier = trade.direction === 'long' ? 1 : -1;
  const grossPnl = (trade.exitPrice - trade.entryPrice) * trade.quantity * multiplier;
  const pnl = grossPnl - trade.commission;
  const pnlPercent = ((trade.exitPrice - trade.entryPrice) / trade.entryPrice) * 100 * multiplier;

  return { pnl, pnlPercent };
}

export function getClosedTrades(trades: Trade[]): Trade[] {
  return trades.filter(t => t.status === 'kapali' && t.pnl !== null && t.exitDate !== null);
}

export function calculateWinRate(trades: Trade[]): number {
  const closed = getClosedTrades(trades);
  if (closed.length === 0) return 0;
  const wins = closed.filter(t => (t.pnl ?? 0) > 0).length;
  return (wins / closed.length) * 100;
}

export function calculateProfitFactor(trades: Trade[]): number {
  const closed = getClosedTrades(trades);
  const grossWins = closed.filter(t => (t.pnl ?? 0) > 0).reduce((sum, t) => sum + (t.pnl ?? 0), 0);
  const grossLosses = Math.abs(closed.filter(t => (t.pnl ?? 0) < 0).reduce((sum, t) => sum + (t.pnl ?? 0), 0));
  if (grossLosses === 0) return grossWins > 0 ? Infinity : 0;
  return grossWins / grossLosses;
}

export function calculateEquityCurve(trades: Trade[], startingBalance: number): { date: string; equity: number }[] {
  const closed = getClosedTrades(trades).sort(
    (a, b) => new Date(a.exitDate!).getTime() - new Date(b.exitDate!).getTime()
  );

  let equity = startingBalance;
  const curve: { date: string; equity: number }[] = [
    { date: closed[0]?.exitDate?.split('T')[0] || new Date().toISOString().split('T')[0], equity: startingBalance }
  ];

  for (const trade of closed) {
    equity += trade.pnl ?? 0;
    curve.push({
      date: trade.exitDate!.split('T')[0],
      equity: Math.round(equity * 100) / 100,
    });
  }

  return curve;
}

export function calculateDrawdown(equityCurve: { date: string; equity: number }[]): {
  series: { date: string; drawdown: number; drawdownPercent: number }[];
  maxDrawdown: number;
  maxDrawdownPercent: number;
} {
  let peak = 0;
  let maxDrawdown = 0;
  let maxDrawdownPercent = 0;
  const series: { date: string; drawdown: number; drawdownPercent: number }[] = [];

  for (const point of equityCurve) {
    if (point.equity > peak) peak = point.equity;
    const drawdown = peak - point.equity;
    const drawdownPercent = peak > 0 ? (drawdown / peak) * 100 : 0;

    if (drawdown > maxDrawdown) maxDrawdown = drawdown;
    if (drawdownPercent > maxDrawdownPercent) maxDrawdownPercent = drawdownPercent;

    series.push({ date: point.date, drawdown, drawdownPercent });
  }

  return { series, maxDrawdown, maxDrawdownPercent };
}

export function calculateDailyReturns(trades: Trade[]): { date: string; pnl: number; pnlPercent: number }[] {
  const closed = getClosedTrades(trades);
  const dailyMap = new Map<string, number>();

  for (const trade of closed) {
    const date = trade.exitDate!.split('T')[0];
    dailyMap.set(date, (dailyMap.get(date) || 0) + (trade.pnl ?? 0));
  }

  return Array.from(dailyMap.entries())
    .map(([date, pnl]) => ({ date, pnl, pnlPercent: 0 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function calculateSharpeRatio(dailyReturns: { pnl: number }[]): number {
  if (dailyReturns.length < 2) return 0;
  const returns = dailyReturns.map(d => d.pnl);
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / (returns.length - 1);
  const stdDev = Math.sqrt(variance);
  if (stdDev === 0) return 0;
  return (mean / stdDev) * Math.sqrt(252);
}

export function groupTradesByPeriod(trades: Trade[], periodType: string): PeriodSummary[] {
  const closed = getClosedTrades(trades);
  const groups = new Map<string, Trade[]>();
  const labels = new Map<string, string>();

  for (const trade of closed) {
    const date = new Date(trade.exitDate!);
    let key: string;
    let lbl: string;

    switch (periodType) {
      case 'gunluk':
        key = trade.exitDate!.split('T')[0];
        lbl = new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'long' }).format(date);
        break;
      case 'haftalik': {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay() + 1);
        key = weekStart.toISOString().split('T')[0];
        lbl = `${new Intl.DateTimeFormat('tr-TR', { day: 'numeric', month: 'short' }).format(weekStart)} Haftasi`;
        break;
      }
      case 'aylik':
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        lbl = new Intl.DateTimeFormat('tr-TR', { month: 'long', year: 'numeric' }).format(date);
        break;
      case 'yillik':
        key = `${date.getFullYear()}`;
        lbl = `${date.getFullYear()}`;
        break;
      default:
        key = trade.exitDate!.split('T')[0];
        lbl = key;
    }

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(trade);
    labels.set(key, lbl);
  }

  const summaries: PeriodSummary[] = [];
  const groupEntries = Array.from(groups.entries());
  for (const [key, groupTrades] of groupEntries) {
    const wins = groupTrades.filter(t => (t.pnl ?? 0) > 0);
    const losses = groupTrades.filter(t => (t.pnl ?? 0) < 0);
    const totalPnL = groupTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const totalComm = groupTrades.reduce((s, t) => s + t.commission, 0);
    const avgWin = wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0;
    const avgLoss = losses.length > 0 ? losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length : 0;
    const grossWins = wins.reduce((s, t) => s + (t.pnl ?? 0), 0);
    const grossLosses = Math.abs(losses.reduce((s, t) => s + (t.pnl ?? 0), 0));

    summaries.push({
      periodKey: key,
      periodLabel: labels.get(key) || key,
      periodType: periodType as PeriodSummary['periodType'],
      totalTrades: groupTrades.length,
      winningTrades: wins.length,
      losingTrades: losses.length,
      winRate: groupTrades.length > 0 ? (wins.length / groupTrades.length) * 100 : 0,
      grossPnL: totalPnL + totalComm,
      netPnL: totalPnL,
      totalCommission: totalComm,
      averageWin: avgWin,
      averageLoss: avgLoss,
      largestWin: wins.length > 0 ? Math.max(...wins.map(t => t.pnl ?? 0)) : 0,
      largestLoss: losses.length > 0 ? Math.min(...losses.map(t => t.pnl ?? 0)) : 0,
      profitFactor: grossLosses > 0 ? grossWins / grossLosses : grossWins > 0 ? Infinity : 0,
    });
  }

  return summaries.sort((a, b) => a.periodKey.localeCompare(b.periodKey));
}

export function calculatePerformanceMetrics(trades: Trade[], startingBalance: number): PerformanceMetrics {
  const closed = getClosedTrades(trades);
  const equityCurve = calculateEquityCurve(trades, startingBalance);
  const dailyReturns = calculateDailyReturns(trades);
  const { series: drawdownSeries, maxDrawdown, maxDrawdownPercent } = calculateDrawdown(equityCurve);
  const wins = closed.filter(t => (t.pnl ?? 0) > 0);
  const losses = closed.filter(t => (t.pnl ?? 0) < 0);

  return {
    equityCurve,
    dailyReturns,
    drawdownSeries,
    maxDrawdown,
    maxDrawdownPercent,
    sharpeRatio: calculateSharpeRatio(dailyReturns),
    winRate: calculateWinRate(trades),
    totalTrades: closed.length,
    totalPnL: closed.reduce((s, t) => s + (t.pnl ?? 0), 0),
    profitFactor: calculateProfitFactor(trades),
    averageWin: wins.length > 0 ? wins.reduce((s, t) => s + (t.pnl ?? 0), 0) / wins.length : 0,
    averageLoss: losses.length > 0 ? losses.reduce((s, t) => s + (t.pnl ?? 0), 0) / losses.length : 0,
    bestDay: dailyReturns.length > 0
      ? dailyReturns.reduce((best, d) => d.pnl > best.pnl ? d : best, dailyReturns[0])
      : { date: '', pnl: 0 },
    worstDay: dailyReturns.length > 0
      ? dailyReturns.reduce((worst, d) => d.pnl < worst.pnl ? d : worst, dailyReturns[0])
      : { date: '', pnl: 0 },
  };
}
