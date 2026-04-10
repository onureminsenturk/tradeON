'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useTrades } from '@/context/TradeContext';
import { formatCurrency, formatDateTime, formatPercent } from '@/lib/formatters';
import { assetTypeLabels, directionLabels } from '@/lib/constants';

function TradeDetail() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tradeId = searchParams.get('id');
  const { trades, updateTrade, deleteTrade, accounts } = useTrades();
  const [exitPrice, setExitPrice] = useState('');
  const [exitDate, setExitDate] = useState('');
  const [notes, setNotes] = useState('');

  const trade = trades.find(t => t.id === tradeId);

  useEffect(() => {
    if (trade) {
      setExitPrice(trade.exitPrice?.toString() || '');
      setExitDate(trade.exitDate ? trade.exitDate.slice(0, 16) : '');
      setNotes(trade.notes || '');
    }
  }, [trade]);

  if (!trade) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-text-muted">Islem bulunamadi.</p>
      </div>
    );
  }

  const handleClose = () => {
    if (!exitPrice) return;
    updateTrade(trade.id, {
      exitPrice: parseFloat(exitPrice),
      exitDate: exitDate ? new Date(exitDate).toISOString() : new Date().toISOString(),
      notes,
      status: 'kapali',
    });
  };

  const handleDelete = () => {
    deleteTrade(trade.id);
    router.push('/islemler');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
            </svg>
          </button>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-text-primary">{trade.symbol}</h1>
              <span className={`text-xs font-medium px-2.5 py-1 rounded ${
                trade.direction === 'long' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
              }`}>
                {directionLabels[trade.direction]}
              </span>
              <span className={`text-xs px-2.5 py-1 rounded-full ${
                trade.status === 'acik' ? 'bg-warning/10 text-warning' : 'bg-bg-quaternary text-text-muted'
              }`}>
                {trade.status === 'acik' ? 'Acik' : 'Kapali'}
              </span>
            </div>
            <p className="text-text-muted text-sm flex items-center gap-2">
              {assetTypeLabels[trade.assetType]}
              {(() => {
                const acc = accounts.find(a => a.id === trade.accountId);
                return acc ? (
                  <span className="text-xs px-2 py-0.5 rounded-full flex items-center gap-1.5" style={{ backgroundColor: acc.color + '15', color: acc.color }}>
                    <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: acc.color }} />
                    {acc.name}
                  </span>
                ) : null;
              })()}
            </p>
          </div>
        </div>
      </div>

      {/* PnL Banner */}
      {trade.pnl !== null && (
        <div className={`rounded-xl p-6 ${trade.pnl >= 0 ? 'bg-profit/5 border border-profit/20' : 'bg-loss/5 border border-loss/20'}`}>
          <div className="flex items-end gap-4">
            <div>
              <p className="text-sm text-text-muted mb-1">Kar/Zarar</p>
              <p className={`text-3xl font-bold font-tabular ${trade.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                {trade.pnl >= 0 ? '+' : ''}{formatCurrency(trade.pnl)}
              </p>
            </div>
            {trade.pnlPercent !== null && (
              <p className={`text-xl font-semibold font-tabular mb-1 ${trade.pnlPercent >= 0 ? 'text-profit/70' : 'text-loss/70'}`}>
                {formatPercent(trade.pnlPercent)}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Before / After Charts & Links */}
      {(trade.beforeChart || trade.afterChart || trade.beforeLink || trade.afterLink) && (
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Grafik Goruntuleri</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {(trade.beforeChart || trade.beforeLink) && (
              <div>
                <p className="text-xs text-text-muted mb-2">Giris Oncesi (Before)</p>
                {trade.beforeChart && (
                  <img src={trade.beforeChart} alt="Before" className="w-full rounded-lg border border-bg-quaternary mb-2" />
                )}
                {trade.beforeLink && (
                  <a href={trade.beforeLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-accent-primary hover:text-accent-hover transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-4.122a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.88" />
                    </svg>
                    Before Link →
                  </a>
                )}
              </div>
            )}
            {(trade.afterChart || trade.afterLink) && (
              <div>
                <p className="text-xs text-text-muted mb-2">Cikis Sonrasi (After)</p>
                {trade.afterChart && (
                  <img src={trade.afterChart} alt="After" className="w-full rounded-lg border border-bg-quaternary mb-2" />
                )}
                {trade.afterLink && (
                  <a href={trade.afterLink} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs text-accent-primary hover:text-accent-hover transition-colors">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-4.122a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.88" />
                    </svg>
                    After Link →
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Islem Detaylari</h3>
          <div className="space-y-3">
            {[
              ['Giris Fiyati', trade.entryPrice.toFixed(4)],
              ['Cikis Fiyati', trade.exitPrice?.toFixed(4) ?? 'Acik'],
              ['Lot', trade.quantity.toString()],
              ['Risk', trade.riskAmount ? formatCurrency(trade.riskAmount) : '-'],
              ['Komisyon', formatCurrency(trade.commission)],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between">
                <span className="text-sm text-text-muted">{label}</span>
                <span className="text-sm text-text-primary font-tabular">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Zaman & Strateji</h3>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">Giris Tarihi</span>
              <span className="text-sm text-text-primary">{formatDateTime(trade.entryDate)}</span>
            </div>
            {trade.exitDate && (
              <div className="flex justify-between">
                <span className="text-sm text-text-muted">Cikis Tarihi</span>
                <span className="text-sm text-text-primary">{formatDateTime(trade.exitDate)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">Strateji</span>
              <span className="text-sm text-text-primary">{trade.strategy || '-'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-text-muted">Degerlendirme</span>
              <span className="text-sm text-accent-primary">{'★'.repeat(trade.rating)}{'☆'.repeat(5 - trade.rating)}</span>
            </div>
            {trade.tags.length > 0 && (
              <div>
                <span className="text-sm text-text-muted block mb-2">Etiketler</span>
                <div className="flex flex-wrap gap-1.5">
                  {trade.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-accent-primary/10 text-accent-primary px-2 py-0.5 rounded">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Notes */}
      {trade.notes && (
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Notlar</h3>
          <p className="text-sm text-text-secondary whitespace-pre-wrap">{trade.notes}</p>
        </div>
      )}

      {/* Close Trade */}
      {trade.status === 'acik' && (
        <div className="bg-bg-secondary border border-warning/30 rounded-xl p-6">
          <h3 className="text-sm font-semibold text-warning mb-4">Islemi Kapat</h3>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Cikis Fiyati</label>
              <input type="number" step="any" value={exitPrice} onChange={e => setExitPrice(e.target.value)}
                className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary font-tabular focus:outline-none focus:border-accent-primary transition-colors" />
            </div>
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Cikis Tarihi</label>
              <input type="datetime-local" value={exitDate} onChange={e => setExitDate(e.target.value)}
                className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary transition-colors" />
            </div>
          </div>
          <button onClick={handleClose} disabled={!exitPrice}
            className="px-6 py-2.5 text-sm rounded-lg bg-warning/10 text-warning hover:bg-warning/20 font-semibold transition-colors disabled:opacity-50">
            Islemi Kapat
          </button>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end">
        <button onClick={handleDelete} className="px-4 py-2 text-sm rounded-lg bg-loss/10 text-loss hover:bg-loss/20 transition-colors">
          Islemi Sil
        </button>
      </div>
    </div>
  );
}

export default function TradeDetailPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[60vh]"><div className="animate-spin w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full" /></div>}>
      <TradeDetail />
    </Suspense>
  );
}
