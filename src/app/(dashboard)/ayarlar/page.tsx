'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTrades } from '@/context/TradeContext';
import { formatCurrency } from '@/lib/formatters';
import { setItem } from '@/lib/storage';

export default function SettingsPage() {
  const { user, updateSettings, logout } = useAuth();
  const { trades, journalEntries } = useTrades();
  const [currency, setCurrency] = useState(user?.settings.currency || 'TRY');
  const [balance, setBalance] = useState(user?.settings.startingBalance?.toString() || '10000');
  const [saved, setSaved] = useState(false);
  const [exportMsg, setExportMsg] = useState('');

  const handleSave = () => {
    updateSettings({
      currency: currency as 'TRY' | 'USD' | 'EUR',
      startingBalance: parseFloat(balance) || 10000,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleExport = () => {
    const data = {
      trades,
      journalEntries,
      exportDate: new Date().toISOString(),
      user: { email: user?.email, displayName: user?.displayName },
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradeon-export-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportMsg('Veriler basariyla disari aktarildi!');
    setTimeout(() => setExportMsg(''), 3000);
  };

  const handleExportCSV = () => {
    const headers = ['Tarih', 'Sembol', 'Tur', 'Yon', 'Giris', 'Cikis', 'Miktar', 'K/Z', 'K/Z %', 'Strateji', 'Not'];
    const rows = trades.map(t => [
      t.entryDate.split('T')[0],
      t.symbol,
      t.assetType,
      t.direction,
      t.entryPrice,
      t.exitPrice ?? '',
      t.quantity,
      t.pnl ?? '',
      t.pnlPercent ? `${t.pnlPercent.toFixed(2)}%` : '',
      t.strategy,
      t.notes.replace(/,/g, ';'),
    ].join(','));

    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tradeon-islemler-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.trades && user) {
          setItem(`trades_${user.id}`, data.trades);
          if (data.journalEntries) {
            setItem(`journal_${user.id}`, data.journalEntries);
          }
          setExportMsg('Veriler basariyla iceri aktarildi! Sayfa yenileniyor...');
          setTimeout(() => window.location.reload(), 1500);
        }
      } catch {
        setExportMsg('Gecersiz dosya formati.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <h1 className="text-2xl font-bold text-text-primary">Ayarlar</h1>

      {/* Account */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Hesap Bilgileri</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Ad Soyad</span>
            <span className="text-sm text-text-primary">{user?.displayName}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">E-posta</span>
            <span className="text-sm text-text-primary">{user?.email}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-text-muted">Kayit Tarihi</span>
            <span className="text-sm text-text-primary">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('tr-TR') : '-'}
            </span>
          </div>
        </div>
      </div>

      {/* Trading Settings */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Trading Ayarlari</h2>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Para Birimi</label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value as 'TRY' | 'USD' | 'EUR')}
            className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary"
          >
            <option value="TRY">₺ Turk Lirasi (TRY)</option>
            <option value="USD">$ ABD Dolari (USD)</option>
            <option value="EUR">€ Euro (EUR)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm text-text-secondary mb-1.5">Baslangic Bakiyesi</label>
          <input
            type="number"
            value={balance}
            onChange={e => setBalance(e.target.value)}
            className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary font-tabular focus:outline-none focus:border-accent-primary"
          />
        </div>

        <button
          onClick={handleSave}
          className="px-6 py-2.5 text-sm rounded-lg bg-accent-primary hover:bg-accent-hover text-bg-primary font-semibold transition-all"
        >
          {saved ? '✓ Kaydedildi!' : 'Kaydet'}
        </button>
      </div>

      {/* Stats */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-4">Istatistikler</h2>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Toplam Islem', value: trades.length.toString() },
            { label: 'Acik Islemler', value: trades.filter(t => t.status === 'acik').length.toString() },
            { label: 'Gunluk Girisleri', value: journalEntries.length.toString() },
            { label: 'Toplam K/Z', value: formatCurrency(trades.reduce((s, t) => s + (t.pnl ?? 0), 0)) },
          ].map((stat, i) => (
            <div key={i} className="bg-bg-tertiary/50 rounded-lg p-3">
              <p className="text-xs text-text-muted">{stat.label}</p>
              <p className="text-lg font-bold text-text-primary font-tabular mt-1">{stat.value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Data */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-6 space-y-4">
        <h2 className="text-lg font-semibold text-text-primary">Veri Yonetimi</h2>

        {exportMsg && (
          <div className="bg-accent-primary/10 border border-accent-primary/30 text-accent-primary rounded-lg p-3 text-sm">
            {exportMsg}
          </div>
        )}

        <div className="flex flex-wrap gap-3">
          <button onClick={handleExport}
            className="px-4 py-2.5 text-sm rounded-lg bg-bg-tertiary border border-bg-quaternary text-text-primary hover:border-accent-primary transition-colors">
            📥 JSON Disa Aktar
          </button>
          <button onClick={handleExportCSV}
            className="px-4 py-2.5 text-sm rounded-lg bg-bg-tertiary border border-bg-quaternary text-text-primary hover:border-accent-primary transition-colors">
            📊 CSV Disa Aktar
          </button>
          <label className="px-4 py-2.5 text-sm rounded-lg bg-bg-tertiary border border-bg-quaternary text-text-primary hover:border-accent-primary transition-colors cursor-pointer">
            📤 Iceri Aktar
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
        </div>
      </div>

      {/* Logout */}
      <div className="bg-bg-secondary border border-loss/20 rounded-xl p-6">
        <h2 className="text-lg font-semibold text-text-primary mb-3">Oturum</h2>
        <button
          onClick={logout}
          className="px-6 py-2.5 text-sm rounded-lg bg-loss/10 text-loss hover:bg-loss/20 font-semibold transition-colors"
        >
          Cikis Yap
        </button>
      </div>
    </div>
  );
}
