'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTrades } from '@/context/TradeContext';
import { calculatePerformanceMetrics, calculateWinRate, calculateProfitFactor, getClosedTrades } from '@/lib/calculations';
import { formatCurrency, formatPercent, formatDateShort } from '@/lib/formatters';
import EquityCurveChart from '@/components/dashboard/EquityCurveChart';
import DailyPnLChart from '@/components/dashboard/DailyPnLChart';
import AssetDistribution from '@/components/dashboard/AssetDistribution';
import WinLossChart from '@/components/dashboard/WinLossChart';
import DirectionChart from '@/components/dashboard/DirectionChart';
import RecentTrades from '@/components/dashboard/RecentTrades';

export default function DashboardPage() {
  const { user } = useAuth();
  const { trades, transactions, addTransaction, deleteTransaction, getNetTransactions } = useTrades();
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');
  const [showTxList, setShowTxList] = useState(false);

  const metrics = useMemo(() => {
    const startingBalance = user?.settings.startingBalance || 10000;
    return calculatePerformanceMetrics(trades, startingBalance);
  }, [trades, user]);

  const closed = getClosedTrades(trades);
  const totalPnL = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const netTransactions = getNetTransactions();
  const currentBalance = (user?.settings.startingBalance || 10000) + totalPnL + netTransactions;

  const handleAddTransaction = () => {
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) return;
    addTransaction({
      type: txType,
      amount,
      note: txNote,
      date: new Date().toISOString(),
    });
    setTxAmount('');
    setTxNote('');
    setShowTxModal(false);
  };
  const winRate = calculateWinRate(trades);
  const profitFactor = calculateProfitFactor(trades);

  const statCards = [
    {
      label: 'Toplam Bakiye',
      value: formatCurrency(currentBalance, user?.settings.currency || 'USD'),
      change: formatPercent((totalPnL / (user?.settings.startingBalance || 10000)) * 100),
      isPositive: totalPnL >= 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18.75a60.07 60.07 0 0115.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 013 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 00-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 01-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 003 15h-.75M15 10.5a3 3 0 11-6 0 3 3 0 016 0zm3 0h.008v.008H18V10.5zm-12 0h.008v.008H6V10.5z" />
        </svg>
      ),
    },
    {
      label: 'Toplam K/Z',
      value: formatCurrency(totalPnL, user?.settings.currency || 'USD'),
      change: `${closed.length} islem`,
      isPositive: totalPnL >= 0,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m-3-2.818l.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: 'Basari Orani',
      value: `%${winRate.toFixed(1)}`,
      change: `${closed.filter(t => (t.pnl ?? 0) > 0).length}K / ${closed.filter(t => (t.pnl ?? 0) < 0).length}Z`,
      isPositive: winRate >= 50,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-5.54 0" />
        </svg>
      ),
    },
    {
      label: 'Profit Faktor',
      value: profitFactor === Infinity ? '∞' : profitFactor.toFixed(2),
      change: `Max DD: %${metrics.maxDrawdownPercent.toFixed(1)}`,
      isPositive: profitFactor >= 1,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">
            Hosgeldin, {user?.displayName?.split(' ')[0]} 👋
          </h1>
          <p className="text-text-muted text-sm mt-1">Trading performansinizin ozeti</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setTxType('deposit'); setShowTxModal(true); }}
            className="inline-flex items-center gap-1.5 bg-profit/10 hover:bg-profit/20 text-profit font-semibold px-4 py-2.5 rounded-lg transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6-6m6 6l6-6" />
            </svg>
            Para Ekle
          </button>
          <button
            onClick={() => { setTxType('withdrawal'); setShowTxModal(true); }}
            className="inline-flex items-center gap-1.5 bg-loss/10 hover:bg-loss/20 text-loss font-semibold px-4 py-2.5 rounded-lg transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6 6m6-6l6 6" />
            </svg>
            Para Cek
          </button>
          <a
            href="/islemler/yeni"
            className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-hover text-bg-primary font-semibold px-5 py-2.5 rounded-lg transition-all hover:shadow-lg hover:shadow-accent-primary/20 text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Yeni Islem
          </a>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <div
            key={i}
            className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5 card-hover"
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <span className={`${card.isPositive ? 'text-profit' : 'text-loss'} opacity-70`}>{card.icon}</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                card.isPositive ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
              }`}>
                {card.change}
              </span>
            </div>
            <p className="text-text-muted text-sm">{card.label}</p>
            <p className={`text-xl font-bold font-tabular mt-1 ${card.isPositive ? 'text-profit' : 'text-loss'}`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      {/* Charts Row 1 - Equity Curve */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-4">Sermaye Egrisi</h3>
        <EquityCurveChart data={metrics.equityCurve} />
      </div>

      {/* Charts Row 2 - Pie Charts */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Kazanc / Kayip</h3>
          <WinLossChart trades={trades} />
        </div>
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Varlik Dagilimi</h3>
          <AssetDistribution trades={trades} />
        </div>
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Long / Short</h3>
          <DirectionChart trades={trades} />
        </div>
      </div>

      {/* Charts Row 3 - Daily PnL + Recent Trades */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Gunluk K/Z</h3>
          <DailyPnLChart data={metrics.dailyReturns.slice(-30)} />
        </div>
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-4">Son Islemler</h3>
          <RecentTrades trades={trades} />
        </div>
      </div>

      {/* Transaction History */}
      {transactions.length > 0 && (
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Para Hareketleri</h3>
            <button
              onClick={() => setShowTxList(!showTxList)}
              className="text-xs text-accent-primary hover:text-accent-hover transition-colors"
            >
              {showTxList ? 'Gizle' : `Tumu (${transactions.length})`}
            </button>
          </div>
          {showTxList && (
            <div className="space-y-2">
              {transactions.map(tx => (
                <div key={tx.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-bg-tertiary/50">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      tx.type === 'deposit' ? 'bg-profit/10 text-profit' : 'bg-loss/10 text-loss'
                    }`}>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        {tx.type === 'deposit'
                          ? <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m0 0l-6-6m6 6l6-6" />
                          : <path strokeLinecap="round" strokeLinejoin="round" d="M12 19.5v-15m0 0l-6 6m6-6l6 6" />
                        }
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-text-primary font-medium">
                        {tx.type === 'deposit' ? 'Para Yatirma' : 'Para Cekme'}
                      </p>
                      <p className="text-xs text-text-muted">
                        {formatDateShort(tx.date)}{tx.note ? ` — ${tx.note}` : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-semibold font-tabular ${
                      tx.type === 'deposit' ? 'text-profit' : 'text-loss'
                    }`}>
                      {tx.type === 'deposit' ? '+' : '-'}{formatCurrency(tx.amount, user?.settings.currency || 'USD')}
                    </span>
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1 text-text-muted hover:text-loss transition-colors"
                      title="Sil"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-bg-quaternary/30 mt-2">
                <span className="text-xs text-text-muted">Net Para Hareketi</span>
                <span className={`text-sm font-bold font-tabular ${netTransactions >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {netTransactions >= 0 ? '+' : ''}{formatCurrency(netTransactions, user?.settings.currency || 'USD')}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transaction Modal */}
      {showTxModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-secondary border border-bg-quaternary rounded-xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-lg font-bold text-text-primary mb-4">
              {txType === 'deposit' ? 'Para Yatir' : 'Para Cek'}
            </h3>

            <div className="space-y-4">
              {/* Type Toggle */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setTxType('deposit')}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                    txType === 'deposit'
                      ? 'bg-profit/20 text-profit border border-profit/50'
                      : 'bg-bg-tertiary text-text-muted border border-bg-quaternary'
                  }`}
                >
                  Yatir
                </button>
                <button
                  type="button"
                  onClick={() => setTxType('withdrawal')}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all ${
                    txType === 'withdrawal'
                      ? 'bg-loss/20 text-loss border border-loss/50'
                      : 'bg-bg-tertiary text-text-muted border border-bg-quaternary'
                  }`}
                >
                  Cek
                </button>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Tutar *</label>
                <input
                  type="number"
                  step="any"
                  value={txAmount}
                  onChange={e => setTxAmount(e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary font-tabular focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="0.00"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Not (istege bagli)</label>
                <input
                  type="text"
                  value={txNote}
                  onChange={e => setTxNote(e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="Banka transferi, bonus..."
                />
              </div>

              <p className="text-xs text-text-muted">
                Bu islem sadece bakiyenizi etkiler. K/Z, basari orani gibi istatistikler degismez.
              </p>
            </div>

            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => { setShowTxModal(false); setTxAmount(''); setTxNote(''); }}
                className="px-4 py-2 text-sm rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
              >
                Iptal
              </button>
              <button
                onClick={handleAddTransaction}
                disabled={!txAmount || parseFloat(txAmount) <= 0}
                className={`px-5 py-2 text-sm rounded-lg font-semibold transition-all disabled:opacity-50 ${
                  txType === 'deposit'
                    ? 'bg-profit/20 text-profit hover:bg-profit/30'
                    : 'bg-loss/20 text-loss hover:bg-loss/30'
                }`}
              >
                {txType === 'deposit' ? 'Yatir' : 'Cek'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
