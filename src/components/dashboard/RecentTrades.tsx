'use client';

import { Trade } from '@/types/trade';
import { formatCurrency, formatDateShort } from '@/lib/formatters';
import { directionLabels } from '@/lib/constants';
import Link from 'next/link';

interface Props {
  trades: Trade[];
}

export default function RecentTrades({ trades }: Props) {
  const recent = trades.slice(0, 8);

  if (recent.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-text-muted text-sm gap-3">
        <svg className="w-12 h-12 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
        </svg>
        <p>Henuz islem eklenmedi</p>
        <Link href="/islemler/yeni" className="text-accent-primary hover:text-accent-hover text-xs">
          Ilk isleminizi ekleyin →
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-64 overflow-y-auto">
      {recent.map(trade => (
        <Link
          key={trade.id}
          href={`/islemler/detay?id=${trade.id}`}
          className="flex items-center justify-between p-3 rounded-lg bg-bg-tertiary/50 hover:bg-bg-tertiary transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
              trade.direction === 'long' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
            }`}>
              {trade.direction === 'long' ? '↑' : '↓'}
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary">{trade.symbol}</p>
              <p className="text-xs text-text-muted">
                {directionLabels[trade.direction]} · {formatDateShort(trade.entryDate)}
              </p>
            </div>
          </div>
          <div className="text-right">
            {trade.pnl !== null ? (
              <>
                <p className={`text-sm font-semibold font-tabular ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
                </p>
                <p className={`text-xs font-tabular ${trade.pnl >= 0 ? 'text-profit/70' : 'text-loss/70'}`}>
                  {trade.pnlPercent !== null ? `${trade.pnlPercent >= 0 ? '+' : ''}${trade.pnlPercent.toFixed(2)}%` : ''}
                </p>
              </>
            ) : (
              <span className="text-xs text-warning font-medium">Acik</span>
            )}
          </div>
        </Link>
      ))}
    </div>
  );
}
