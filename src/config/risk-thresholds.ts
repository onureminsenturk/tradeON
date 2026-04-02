import { RiskLevel } from '@/types/risk';

export const riskLevelLabels: Record<RiskLevel, string> = {
  'cok-dusuk': 'Cok Dusuk',
  'dusuk': 'Dusuk',
  'orta': 'Orta',
  'yuksek': 'Yuksek',
  'cok-yuksek': 'Cok Yuksek',
};

export const riskLevelColors: Record<RiskLevel, string> = {
  'cok-dusuk': '#10b981',
  'dusuk': '#34d399',
  'orta': '#f59e0b',
  'yuksek': '#f97316',
  'cok-yuksek': '#ef4444',
};

export function scoreToRiskLevel(score: number): RiskLevel {
  if (score < 20) return 'cok-dusuk';
  if (score < 40) return 'dusuk';
  if (score < 60) return 'orta';
  if (score < 80) return 'yuksek';
  return 'cok-yuksek';
}
