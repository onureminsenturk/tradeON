'use client';

import { useMemo } from 'react';
import { useTrades } from '@/context/TradeContext';
import { useAuth } from '@/context/AuthContext';
import { calculateRiskProfile } from '@/lib/risk-engine';
import { riskLevelLabels, riskLevelColors } from '@/config/risk-thresholds';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, ResponsiveContainer } from 'recharts';

export default function RiskProfilePage() {
  const { trades } = useTrades();
  const { user } = useAuth();

  const profile = useMemo(
    () => calculateRiskProfile(trades, user?.settings.startingBalance || 10000),
    [trades, user]
  );

  const radarData = [
    { factor: 'Buyume', value: Math.min(Math.abs(profile.factors.averageDailyGrowth) * 20, 100) },
    { factor: 'Volatilite', value: Math.min(profile.factors.volatility * 10, 100) },
    { factor: 'Max Dusus', value: Math.min(profile.factors.maxDrawdownPercent, 100) },
    { factor: 'Yogunlasma', value: profile.factors.concentrationRisk },
    { factor: 'Risk/Odul', value: Math.min(profile.factors.avgRiskRewardRatio * 25, 100) },
    { factor: 'Basari', value: profile.factors.winRate },
    { factor: 'Tutarlilik', value: profile.factors.consistencyScore },
  ];

  const gaugeAngle = (profile.score / 100) * 180;
  const riskColor = riskLevelColors[profile.level];

  return (
    <div className="space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Risk Profili</h1>

      {/* Risk Gauge */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-8 flex flex-col items-center">
        <div className="relative w-64 h-32 mb-4">
          <svg viewBox="0 0 200 100" className="w-full h-full">
            {/* Background arc */}
            <path
              d="M 10 100 A 90 90 0 0 1 190 100"
              fill="none"
              stroke="#1f2937"
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Gradient arc segments */}
            {[
              { start: 0, end: 36, color: '#10b981' },
              { start: 36, end: 72, color: '#34d399' },
              { start: 72, end: 108, color: '#f59e0b' },
              { start: 108, end: 144, color: '#f97316' },
              { start: 144, end: 180, color: '#ef4444' },
            ].map((seg, i) => {
              const x1 = 100 - 90 * Math.cos((seg.start * Math.PI) / 180);
              const y1 = 100 - 90 * Math.sin((seg.start * Math.PI) / 180);
              const x2 = 100 - 90 * Math.cos((seg.end * Math.PI) / 180);
              const y2 = 100 - 90 * Math.sin((seg.end * Math.PI) / 180);
              return (
                <path
                  key={i}
                  d={`M ${x1} ${y1} A 90 90 0 0 1 ${x2} ${y2}`}
                  fill="none"
                  stroke={seg.color}
                  strokeWidth="12"
                  strokeLinecap="round"
                  opacity={0.3}
                />
              );
            })}
            {/* Needle */}
            <line
              x1="100"
              y1="100"
              x2={100 - 70 * Math.cos((gaugeAngle * Math.PI) / 180)}
              y2={100 - 70 * Math.sin((gaugeAngle * Math.PI) / 180)}
              stroke={riskColor}
              strokeWidth="3"
              strokeLinecap="round"
            />
            <circle cx="100" cy="100" r="6" fill={riskColor} />
          </svg>
        </div>
        <div className="text-center">
          <p className="text-4xl font-bold font-tabular" style={{ color: riskColor }}>{profile.score}</p>
          <p className="text-lg font-semibold mt-1" style={{ color: riskColor }}>
            {riskLevelLabels[profile.level]}
          </p>
          <p className="text-sm text-text-muted mt-1">Risk Skoru (0-100)</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar Chart */}
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Risk Faktorleri</h3>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(75, 85, 99, 0.3)" />
                <PolarAngleAxis
                  dataKey="factor"
                  tick={{ fill: '#9ca3af', fontSize: 11 }}
                />
                <Radar
                  dataKey="value"
                  stroke="#06b6d4"
                  fill="#06b6d4"
                  fillOpacity={0.2}
                  strokeWidth={2}
                  animationDuration={800}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Risk Metrics */}
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Detay Metrikler</h3>
          <div className="space-y-4">
            {[
              { label: 'Ortalama Gunluk Buyume', value: `%${profile.factors.averageDailyGrowth.toFixed(3)}`, color: profile.factors.averageDailyGrowth >= 0 ? 'text-profit' : 'text-loss' },
              { label: 'Volatilite', value: `%${profile.factors.volatility.toFixed(2)}`, color: profile.factors.volatility > 3 ? 'text-loss' : 'text-profit' },
              { label: 'Max Dusus', value: `%${profile.factors.maxDrawdownPercent.toFixed(2)}`, color: 'text-loss' },
              { label: 'Yogunlasma Riski', value: `%${profile.factors.concentrationRisk.toFixed(0)}`, color: profile.factors.concentrationRisk > 70 ? 'text-warning' : 'text-profit' },
              { label: 'Ort. Risk/Odul', value: profile.factors.avgRiskRewardRatio.toFixed(2), color: profile.factors.avgRiskRewardRatio >= 1.5 ? 'text-profit' : 'text-warning' },
              { label: 'Basari Orani', value: `%${profile.factors.winRate.toFixed(1)}`, color: profile.factors.winRate >= 50 ? 'text-profit' : 'text-loss' },
              { label: 'Tutarlilik', value: `%${profile.factors.consistencyScore.toFixed(0)}`, color: profile.factors.consistencyScore >= 60 ? 'text-profit' : 'text-warning' },
            ].map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="text-sm text-text-secondary">{m.label}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-1.5 bg-bg-quaternary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(Math.abs(parseFloat(m.value.replace('%', '').replace(',', '.'))) * (m.label === 'Ort. Risk/Odul' ? 25 : 1), 100)}%`,
                        backgroundColor: m.color === 'text-profit' ? '#10b981' : m.color === 'text-loss' ? '#ef4444' : '#f59e0b',
                      }}
                    />
                  </div>
                  <span className={`text-sm font-tabular font-semibold ${m.color} w-16 text-right`}>{m.value}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommendations */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-6">
        <h3 className="text-sm font-semibold text-text-primary mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-accent-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
          </svg>
          Oneriler
        </h3>
        <div className="space-y-3">
          {profile.recommendations.map((rec, i) => (
            <div key={i} className="flex gap-3 items-start p-3 rounded-lg bg-bg-tertiary/50">
              <span className="text-accent-primary text-sm mt-0.5">•</span>
              <p className="text-sm text-text-secondary">{rec}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
