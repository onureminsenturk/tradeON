import { Trade } from '@/types/trade';
import { RiskProfile, RiskLevel } from '@/types/risk';
import { getClosedTrades, calculateDailyReturns, calculateDrawdown, calculateEquityCurve, calculateWinRate } from './calculations';
import { scoreToRiskLevel } from '@/config/risk-thresholds';

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function calculateRiskProfile(trades: Trade[], startingBalance: number): RiskProfile {
  const closed = getClosedTrades(trades);

  if (closed.length < 3) {
    return {
      level: 'orta',
      score: 50,
      factors: {
        averageDailyGrowth: 0,
        volatility: 0,
        maxDrawdownPercent: 0,
        concentrationRisk: 0,
        avgRiskRewardRatio: 0,
        winRate: 0,
        consistencyScore: 0,
      },
      recommendations: ['Daha fazla islem verisi gerekiyor. En az 10 islem sonrasi daha doğru bir risk profili olusturulabilir.'],
    };
  }

  const dailyReturns = calculateDailyReturns(trades);
  const equityCurve = calculateEquityCurve(trades, startingBalance);
  const { maxDrawdownPercent } = calculateDrawdown(equityCurve);

  // Factor 1: Average daily growth (weight: 25%)
  const dailyPnLs = dailyReturns.map(d => d.pnl);
  const avgDailyGrowth = dailyPnLs.length > 0
    ? (dailyPnLs.reduce((a, b) => a + b, 0) / dailyPnLs.length / startingBalance) * 100
    : 0;
  let growthScore: number;
  if (Math.abs(avgDailyGrowth) < 0.5) growthScore = clamp(Math.abs(avgDailyGrowth) * 40, 0, 20);
  else if (Math.abs(avgDailyGrowth) < 1) growthScore = 20 + (Math.abs(avgDailyGrowth) - 0.5) * 40;
  else if (Math.abs(avgDailyGrowth) < 2) growthScore = 40 + (Math.abs(avgDailyGrowth) - 1) * 20;
  else if (Math.abs(avgDailyGrowth) < 5) growthScore = 60 + (Math.abs(avgDailyGrowth) - 2) * 6.67;
  else growthScore = 80 + clamp((Math.abs(avgDailyGrowth) - 5) * 4, 0, 20);

  // Factor 2: Volatility (weight: 20%)
  const volatility = stdDev(dailyPnLs.map(p => (p / startingBalance) * 100));
  const volatilityScore = clamp(volatility * 10, 0, 100);

  // Factor 3: Max drawdown (weight: 20%)
  let drawdownScore: number;
  if (maxDrawdownPercent < 5) drawdownScore = maxDrawdownPercent * 4;
  else if (maxDrawdownPercent < 10) drawdownScore = 20 + (maxDrawdownPercent - 5) * 4;
  else if (maxDrawdownPercent < 20) drawdownScore = 40 + (maxDrawdownPercent - 10) * 2;
  else if (maxDrawdownPercent < 40) drawdownScore = 60 + (maxDrawdownPercent - 20);
  else drawdownScore = 80 + clamp((maxDrawdownPercent - 40) * 0.5, 0, 20);

  // Factor 4: Concentration risk (weight: 15%)
  const assetCounts = new Map<string, number>();
  closed.forEach(t => assetCounts.set(t.assetType, (assetCounts.get(t.assetType) || 0) + 1));
  const maxConcentration = Math.max(...Array.from(assetCounts.values())) / closed.length * 100;
  const concentrationScore = clamp(maxConcentration - 20, 0, 100);

  // Factor 5: Risk/Reward ratio (weight: 10%) - based on actual entry/exit
  const rrs = closed.filter(t => t.exitPrice && t.entryPrice).map(t => {
    const reward = Math.abs((t.exitPrice ?? t.entryPrice) - t.entryPrice);
    const avgMove = (t.entryPrice * 0.02); // estimate 2% as base risk
    return avgMove > 0 ? reward / avgMove : 1;
  });
  const avgRR = rrs.length > 0 ? rrs.reduce((a, b) => a + b, 0) / rrs.length : 1;
  const rrScore = clamp(100 - avgRR * 25, 0, 100);

  // Factor 6: Consistency (weight: 10%)
  const positionSizes = closed.map(t => t.quantity * t.entryPrice);
  const consistencyCoV = positionSizes.length > 1
    ? stdDev(positionSizes) / (positionSizes.reduce((a, b) => a + b, 0) / positionSizes.length)
    : 0;
  const consistencyScore = clamp(consistencyCoV * 50, 0, 100);

  const winRate = calculateWinRate(trades);

  // Weighted total
  const totalScore = clamp(
    growthScore * 0.25 +
    volatilityScore * 0.20 +
    drawdownScore * 0.20 +
    concentrationScore * 0.15 +
    rrScore * 0.10 +
    consistencyScore * 0.10,
    0, 100
  );

  const level = scoreToRiskLevel(Math.round(totalScore));
  const recommendations = generateRecommendations(level, {
    avgDailyGrowth, volatility, maxDrawdownPercent, maxConcentration, avgRR, winRate, consistencyCoV
  });

  return {
    level,
    score: Math.round(totalScore),
    factors: {
      averageDailyGrowth: avgDailyGrowth,
      volatility,
      maxDrawdownPercent,
      concentrationRisk: maxConcentration,
      avgRiskRewardRatio: avgRR,
      winRate,
      consistencyScore: 100 - consistencyScore,
    },
    recommendations,
  };
}

function generateRecommendations(
  level: RiskLevel,
  factors: {
    avgDailyGrowth: number; volatility: number; maxDrawdownPercent: number;
    maxConcentration: number; avgRR: number; winRate: number; consistencyCoV: number;
  }
): string[] {
  const recs: string[] = [];

  if (factors.maxDrawdownPercent > 20) {
    recs.push('Maksimum dususunuz %20\'yi asıyor. Pozisyon buyuklugunuzu kucultmeyi dusunun.');
  }
  if (factors.volatility > 5) {
    recs.push('Gunluk getiri volatiliteniz yuksek. Daha tutarli bir strateji gelistirin.');
  }
  if (factors.maxConcentration > 70) {
    recs.push('Islemlerinizin cogu tek bir varlik turunde yogunlasiyor. Portfoyunuzu cesitlendirin.');
  }
  if (factors.avgRR < 1.5) {
    recs.push('Ortalama risk/odul oranınız dusuk. Islemlerde daha iyi giris noktalari arayin.');
  }
  if (factors.winRate < 40) {
    recs.push('Basari oranınız %40\'ın altinda. Islem stratejinizi gozden gecirin.');
  }
  if (factors.consistencyCoV > 1) {
    recs.push('Pozisyon buyuklugunuzde tutarsizlik var. Sabit bir risk yonetimi kurali belirleyin.');
  }

  if (level === 'cok-yuksek' || level === 'yuksek') {
    recs.push('Genel risk profiliniz yuksek. Sermayenizin %1-2\'sinden fazlasini tek islemde riske atmayin.');
  }

  if (recs.length === 0) {
    recs.push('Risk profiliniz dengeli gorunuyor. Mevcut stratejinize devam edin.');
  }

  return recs;
}
