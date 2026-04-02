'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { useTrades } from '@/context/TradeContext';
import { AssetType, TradeDirection } from '@/types/trade';
import { formatCurrency, formatDateShort, formatPercent } from '@/lib/formatters';
import { assetTypeLabels, directionLabels } from '@/lib/constants';

export default function TradesPage() {
  const { trades, deleteTrade } = useTrades();
  const [search, setSearch] = useState('');
  const [filterAsset, setFilterAsset] = useState<AssetType | ''>('');
  const [filterDirection, setFilterDirection] = useState<TradeDirection | ''>('');
  const [filterStatus, setFilterStatus] = useState<'acik' | 'kapali' | ''>('');
  const [sortField, setSortField] = useState<'entryDate' | 'pnl' | 'symbol'>('entryDate');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    let result = [...trades];

    if (search) {
      const q = search.toLowerCase();
      result = result.filter(t => t.symbol.toLowerCase().includes(q) || t.strategy.toLowerCase().includes(q));
    }
    if (filterAsset) result = result.filter(t => t.assetType === filterAsset);
    if (filterDirection) result = result.filter(t => t.direction === filterDirection);
    if (filterStatus) result = result.filter(t => t.status === filterStatus);

    result.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'entryDate') cmp = new Date(a.entryDate).getTime() - new Date(b.entryDate).getTime();
      else if (sortField === 'pnl') cmp = (a.pnl ?? 0) - (b.pnl ?? 0);
      else if (sortField === 'symbol') cmp = a.symbol.localeCompare(b.symbol);
      return sortDir === 'desc' ? -cmp : cmp;
    });

    return result;
  }, [trades, search, filterAsset, filterDirection, filterStatus, sortField, sortDir]);

  const toggleSort = (field: typeof sortField) => {
    if (sortField === field) setSortDir((d: string) => d === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const totalPnL = filtered.reduce((s, t) => s + (t.pnl ?? 0), 0);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Islemler</h1>
          <p className="text-text-muted text-sm mt-1">{trades.length} islem kayitli</p>
        </div>
        <Link
          href="/islemler/yeni"
          className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-hover text-bg-primary font-semibold px-5 py-2.5 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yeni Islem
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Sembol veya strateji ara..."
          className="bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary w-full sm:w-64"
        />
        <select
          value={filterAsset}
          onChange={e => setFilterAsset(e.target.value as AssetType | '')}
          className="bg-bg-tertiary border border-bg-quaternary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
        >
          <option value="">Tum Varliklar</option>
          {Object.entries(assetTypeLabels).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
        <select
          value={filterDirection}
          onChange={e => setFilterDirection(e.target.value as TradeDirection | '')}
          className="bg-bg-tertiary border border-bg-quaternary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
        >
          <option value="">Tum Yonler</option>
          <option value="long">Long</option>
          <option value="short">Short</option>
        </select>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value as 'acik' | 'kapali' | '')}
          className="bg-bg-tertiary border border-bg-quaternary rounded-lg px-3 py-2 text-sm text-text-primary focus:outline-none focus:border-accent-primary"
        >
          <option value="">Tum Durumlar</option>
          <option value="acik">Acik</option>
          <option value="kapali">Kapali</option>
        </select>
      </div>

      {/* Summary */}
      <div className="flex gap-4 text-sm">
        <span className="text-text-muted">{filtered.length} islem</span>
        <span className={`font-tabular font-semibold ${totalPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
          Toplam: {totalPnL >= 0 ? '+' : ''}{formatCurrency(totalPnL)}
        </span>
      </div>

      {/* Table */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-bg-quaternary/50">
                {[
                  { key: 'entryDate', label: 'Tarih' },
                  { key: 'symbol', label: 'Sembol' },
                  { key: null, label: 'Tur' },
                  { key: null, label: 'Yon' },
                  { key: null, label: 'Giris' },
                  { key: null, label: 'Cikis' },
                  { key: null, label: 'Lot' },
                  { key: null, label: 'Risk' },
                  { key: 'pnl', label: 'K/Z' },
                  { key: null, label: 'K/Z %' },
                  { key: null, label: 'Durum' },
                  { key: null, label: '' },
                ].map((col, i) => (
                  <th
                    key={i}
                    onClick={() => col.key && toggleSort(col.key as 'entryDate' | 'pnl' | 'symbol')}
                    className={`text-left text-xs font-medium text-text-muted px-4 py-3 ${col.key ? 'cursor-pointer hover:text-text-primary' : ''}`}
                  >
                    <span className="flex items-center gap-1">
                      {col.label}
                      {col.key && sortField === col.key && (
                        <span className="text-accent-primary">{sortDir === 'asc' ? '↑' : '↓'}</span>
                      )}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={12} className="text-center text-text-muted py-12">
                    Islem bulunamadi.
                  </td>
                </tr>
              ) : (
                filtered.map(trade => (
                  <tr key={trade.id} className="border-b border-bg-quaternary/20 hover:bg-bg-tertiary/30 transition-colors">
                    <td className="px-4 py-3 text-sm text-text-secondary font-tabular">
                      {formatDateShort(trade.entryDate)}
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/islemler/detay?id=${trade.id}`} className="text-sm font-semibold text-text-primary hover:text-accent-primary transition-colors">
                        {trade.symbol}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-text-muted">
                      {assetTypeLabels[trade.assetType]}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                        trade.direction === 'long' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
                      }`}>
                        {directionLabels[trade.direction]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-tabular text-text-primary">
                      {trade.entryPrice.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-sm font-tabular text-text-primary">
                      {trade.exitPrice?.toFixed(2) ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-sm font-tabular text-text-secondary">
                      {trade.quantity}
                    </td>
                    <td className="px-4 py-3 text-sm font-tabular text-text-secondary">
                      {trade.riskAmount ? formatCurrency(trade.riskAmount) : '-'}
                    </td>
                    <td className={`px-4 py-3 text-sm font-semibold font-tabular ${
                      (trade.pnl ?? 0) >= 0 ? 'text-profit' : 'text-loss'
                    }`}>
                      {trade.pnl !== null ? `${trade.pnl >= 0 ? '+' : ''}${formatCurrency(trade.pnl)}` : '-'}
                    </td>
                    <td className={`px-4 py-3 text-sm font-tabular ${
                      (trade.pnlPercent ?? 0) >= 0 ? 'text-profit' : 'text-loss'
                    }`}>
                      {trade.pnlPercent !== null ? formatPercent(trade.pnlPercent) : '-'}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        trade.status === 'acik' ? 'bg-warning/10 text-warning' : 'bg-bg-quaternary text-text-muted'
                      }`}>
                        {trade.status === 'acik' ? 'Acik' : 'Kapali'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setDeleteId(trade.id)}
                        className="text-text-muted hover:text-loss transition-colors p-1"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-secondary border border-bg-quaternary rounded-xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-lg font-bold text-text-primary mb-2">Islemi Sil</h3>
            <p className="text-text-secondary text-sm mb-6">Bu islemi silmek istediginize emin misiniz? Bu islem geri alinamaz.</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setDeleteId(null)}
                className="px-4 py-2 text-sm rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
              >
                Iptal
              </button>
              <button
                onClick={() => { deleteTrade(deleteId); setDeleteId(null); }}
                className="px-4 py-2 text-sm rounded-lg bg-loss/10 text-loss hover:bg-loss/20 transition-colors"
              >
                Sil
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
