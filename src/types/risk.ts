export type RiskLevel = 'cok-dusuk' | 'dusuk' | 'orta' | 'yuksek' | 'cok-yuksek';

export interface RiskProfile {
  level: RiskLevel;
  score: number;
  factors: {
    averageDailyGrowth: number;
    volatility: number;
    maxDrawdownPercent: number;
    concentrationRisk: number;
    avgRiskRewardRatio: number;
    winRate: number;
    consistencyScore: number;
  };
  recommendations: string[];
}
