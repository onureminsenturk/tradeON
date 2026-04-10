'use client';

import { useMemo, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTrades } from '@/context/TradeContext';
import { calculatePerformanceMetrics, calculateWinRate, calculateProfitFactor, getClosedTrades } from '@/lib/calculations';
import { formatCurrency, formatPercent, formatDateShort } from '@/lib/formatters';
import { accountTypeLabels, accountColors } from '@/lib/constants';
import EquityCurveChart from '@/components/dashboard/EquityCurveChart';
import DailyPnLChart from '@/components/dashboard/DailyPnLChart';
import AssetDistribution from '@/components/dashboard/AssetDistribution';
import WinLossChart from '@/components/dashboard/WinLossChart';
import DirectionChart from '@/components/dashboard/DirectionChart';
import RecentTrades from '@/components/dashboard/RecentTrades';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    filteredTrades, filteredTransactions, transactions,
    accounts, activeAccountId, setActiveAccountId,
    addTransaction, deleteTransaction, getNetTransactions,
    addAccount, deleteAccount,
  } = useTrades();
  const [showTxModal, setShowTxModal] = useState(false);
  const [txType, setTxType] = useState<'deposit' | 'withdrawal'>('deposit');
  const [txAmount, setTxAmount] = useState('');
  const [txNote, setTxNote] = useState('');
  const [showTxList, setShowTxList] = useState(false);
  const [showNewAccount, setShowNewAccount] = useState(false);
  const [newAccName, setNewAccName] = useState('');
  const [newAccType, setNewAccType] = useState<'funded' | 'kripto' | 'kisisel' | 'demo' | 'diger'>('kisisel');
  const [newAccBalance, setNewAccBalance] = useState('');
  const [deleteAccId, setDeleteAccId] = useState<string | null>(null);

  const trades = filteredTrades;

  const metrics = useMemo(() => {
    const startingBalance = activeAccountId
      ? accounts.find(a => a.id === activeAccountId)?.balance || 10000
      : user?.settings.startingBalance || 10000;
    return calculatePerformanceMetrics(trades, startingBalance);
  }, [trades, user, activeAccountId, accounts]);

  const closed = getClosedTrades(trades);
  const totalPnL = closed.reduce((s, t) => s + (t.pnl ?? 0), 0);
  const netTransactions = getNetTransactions();
  const startBal = activeAccountId
    ? accounts.find(a => a.id === activeAccountId)?.balance || 10000
    : user?.settings.startingBalance || 10000;
  const currentBalance = startBal + totalPnL + netTransactions;

  const handleAddTransaction = () => {
    const amount = parseFloat(txAmount);
    if (!amount || amount <= 0) return;
    addTransaction({
      type: txType,
      amount,
      note: txNote,
      date: new Date().toISOString(),
      accountId: activeAccountId,
    });
    setTxAmount('');
    setTxNote('');
    setShowTxModal(false);
  };

  const handleAddAccount = () => {
    if (!newAccName.trim()) return;
    addAccount({
      name: newAccName.trim(),
      type: newAccType,
      balance: parseFloat(newAccBalance) || 0,
      currency: user?.settings.currency || 'USD',
      color: accountColors[accounts.length % accountColors.length],
    });
    setNewAccName('');
    setNewAccBalance('');
    setShowNewAccount(false);
  };

  const winRate = calculateWinRate(trades);
  const profitFactor = calculateProfitFactor(trades);

  const activeAccount = accounts.find(a => a.id === activeAccountId);

  const statCards = [
    {
      label: activeAccount ? `${activeAccount.name} Bakiye` : 'Toplam Bakiye',
      value: formatCurrency(currentBalance, user?.settings.currency || 'USD'),
      change: formatPercent((totalPnL / startBal) * 100),
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

  const displayTxs = activeAccountId !== null
    ? filteredTransactions
    : transactions;

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
        <div className="flex gap-2 flex-wrap">
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

      {/* Account Selector */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-text-primary">Hesaplar</h3>
          <button
            onClick={() => setShowNewAccount(true)}
            className="text-xs text-accent-primary hover:text-accent-hover transition-colors flex items-center gap-1"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Yeni Hesap
          </button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setActiveAccountId(null)}
            className={`px-4 py-2 text-sm rounded-lg font-medium transition-all ${
              activeAccountId === null
                ? 'bg-accent-primary/15 text-accent-primary border border-accent-primary/40'
                : 'bg-bg-tertiary text-text-muted border border-bg-quaternary hover:border-text-muted'
            }`}
          >
            Tum Hesaplar
          </button>
          {accounts.map(acc => {
            const isActive = activeAccountId === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => setActiveAccountId(isActive ? null : acc.id)}
                className={`px-4 py-2 text-sm rounded-lg font-medium transition-all relative group ${
                  isActive
                    ? 'border text-text-primary'
                    : 'bg-bg-tertiary text-text-muted border border-bg-quaternary hover:border-text-muted'
                }`}
                style={isActive ? { backgroundColor: `${acc.color}15`, borderColor: `${acc.color}60`, color: acc.color } : {}}
              >
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }} />
                  {acc.name}
                </span>
                {/* Delete button */}
                <span
                  onClick={(e) => { e.stopPropagation(); setDeleteAccId(acc.id); }}
                  className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-loss/80 rounded-full items-center justify-center text-white text-[8px] hidden group-hover:flex cursor-pointer"
                >
                  ✕
                </span>
              </button>
            );
          })}
        </div>
        {/* Account summary cards */}
        {accounts.length > 0 && activeAccountId === null && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mt-4 pt-3 border-t border-bg-quaternary/30">
            {accounts.map(acc => {
              const accTrades = getClosedTrades(trades.filter(t => t.accountId === acc.id));
              const accPnL = accTrades.reduce((s, t) => s + (t.pnl ?? 0), 0);
              const accNetTx = getNetTransactions(acc.id);
              const accBalance = acc.balance + accPnL + accNetTx;
              return (
                <div
                  key={acc.id}
                  onClick={() => setActiveAccountId(acc.id)}
                  className="bg-bg-tertiary/50 rounded-lg p-3 cursor-pointer hover:bg-bg-tertiary transition-colors"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: acc.color }} />
                    <span className="text-xs text-text-secondary font-medium truncate">{acc.name}</span>
                    <span className="text-[10px] text-text-muted ml-auto">{accountTypeLabels[acc.type]}</span>
                  </div>
                  <p className="text-sm font-bold font-tabular text-text-primary">
                    {formatCurrency(accBalance, acc.currency || 'USD')}
                  </p>
                  <p className={`text-xs font-tabular mt-0.5 ${accPnL >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {accPnL >= 0 ? '+' : ''}{formatCurrency(accPnL, acc.currency || 'USD')} K/Z
                  </p>
                </div>
              );
            })}
          </div>
        )}
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
      {displayTxs.length > 0 && (
        <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-text-primary">Para Hareketleri</h3>
            <button
              onClick={() => setShowTxList(!showTxList)}
              className="text-xs text-accent-primary hover:text-accent-hover transition-colors"
            >
              {showTxList ? 'Gizle' : `Tumu (${displayTxs.length})`}
            </button>
          </div>
          {showTxList && (
            <div className="space-y-2">
              {displayTxs.map(tx => {
                const txAcc = accounts.find(a => a.id === tx.accountId);
                return (
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
                        <p className="text-sm text-text-primary font-medium flex items-center gap-2">
                          {tx.type === 'deposit' ? 'Para Yatirma' : 'Para Cekme'}
                          {txAcc && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: `${txAcc.color}15`, color: txAcc.color }}>
                              {txAcc.name}
                            </span>
                          )}
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
                );
              })}
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
              <div className="grid grid-cols-2 gap-2">
                <button type="button" onClick={() => setTxType('deposit')}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all ${txType === 'deposit' ? 'bg-profit/20 text-profit border border-profit/50' : 'bg-bg-tertiary text-text-muted border border-bg-quaternary'}`}>Yatir</button>
                <button type="button" onClick={() => setTxType('withdrawal')}
                  className={`py-2 rounded-lg text-sm font-semibold transition-all ${txType === 'withdrawal' ? 'bg-loss/20 text-loss border border-loss/50' : 'bg-bg-tertiary text-text-muted border border-bg-quaternary'}`}>Cek</button>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Tutar *</label>
                <input type="number" step="any" value={txAmount} onChange={e => setTxAmount(e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary font-tabular focus:outline-none focus:border-accent-primary transition-colors" placeholder="0.00" autoFocus />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Not (istege bagli)</label>
                <input type="text" value={txNote} onChange={e => setTxNote(e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors" placeholder="Banka transferi, bonus..." />
              </div>
              {activeAccountId && activeAccount && (
                <p className="text-xs text-accent-primary">Hesap: {activeAccount.name}</p>
              )}
              <p className="text-xs text-text-muted">Bu islem sadece bakiyeyi etkiler. K/Z istatistikleri degismez.</p>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setShowTxModal(false); setTxAmount(''); setTxNote(''); }}
                className="px-4 py-2 text-sm rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors">Iptal</button>
              <button onClick={handleAddTransaction} disabled={!txAmount || parseFloat(txAmount) <= 0}
                className={`px-5 py-2 text-sm rounded-lg font-semibold transition-all disabled:opacity-50 ${txType === 'deposit' ? 'bg-profit/20 text-profit hover:bg-profit/30' : 'bg-loss/20 text-loss hover:bg-loss/30'}`}>
                {txType === 'deposit' ? 'Yatir' : 'Cek'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Account Modal */}
      {showNewAccount && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-secondary border border-bg-quaternary rounded-xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-lg font-bold text-text-primary mb-4">Yeni Hesap Ekle</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Hesap Adi *</label>
                <input type="text" value={newAccName} onChange={e => setNewAccName(e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="orn: Funded 100K, OKX Kripto..." autoFocus />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Hesap Turu</label>
                <select value={newAccType} onChange={e => setNewAccType(e.target.value as typeof newAccType)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary transition-colors">
                  {Object.entries(accountTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Baslangic Bakiyesi</label>
                <input type="number" step="any" value={newAccBalance} onChange={e => setNewAccBalance(e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary font-tabular focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="orn: 100000" />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button onClick={() => { setShowNewAccount(false); setNewAccName(''); setNewAccBalance(''); }}
                className="px-4 py-2 text-sm rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors">Iptal</button>
              <button onClick={handleAddAccount} disabled={!newAccName.trim()}
                className="px-5 py-2 text-sm rounded-lg bg-accent-primary hover:bg-accent-hover text-bg-primary font-semibold transition-all disabled:opacity-50">Olustur</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Confirm */}
      {deleteAccId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-secondary border border-bg-quaternary rounded-xl p-6 max-w-sm w-full animate-fade-in">
            <h3 className="text-lg font-bold text-text-primary mb-2">Hesabi Sil</h3>
            <p className="text-text-secondary text-sm mb-1">
              <strong>{accounts.find(a => a.id === deleteAccId)?.name}</strong> hesabini silmek istediginize emin misiniz?
            </p>
            <p className="text-text-muted text-xs mb-6">Islemler silinmez, sadece hesapsiz olarak kalir.</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setDeleteAccId(null)}
                className="px-4 py-2 text-sm rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors">Iptal</button>
              <button onClick={() => { deleteAccount(deleteAccId); setDeleteAccId(null); }}
                className="px-4 py-2 text-sm rounded-lg bg-loss/10 text-loss hover:bg-loss/20 transition-colors">Sil</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
