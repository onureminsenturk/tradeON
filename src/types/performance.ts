export type PeriodType = 'gunluk' | 'haftalik' | 'aylik' | 'yillik';

export interface PeriodSummary {
  periodKey: string;
  periodLabel: string;
  periodType: PeriodType;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  grossPnL: number;
  netPnL: number;
  totalCommission: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
}

export interface PerformanceMetrics {
  equityCurve: { date: string; equity: number }[];
  dailyReturns: { date: string; pnl: number; pnlPercent: number }[];
  drawdownSeries: { date: string; drawdown: number; drawdownPercent: number }[];
  maxDrawdown: number;
  maxDrawdownPercent: number;
  sharpeRatio: number;
  winRate: number;
  totalTrades: number;
  totalPnL: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  bestDay: { date: string; pnl: number };
  worstDay: { date: string; pnl: number };
}
