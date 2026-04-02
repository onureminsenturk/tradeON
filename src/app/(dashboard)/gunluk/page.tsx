'use client';

import { useState, useMemo } from 'react';
import { useTrades } from '@/context/TradeContext';
import { DayMood, JournalEntry } from '@/types/trade';
import { moodEmojis, moodLabels, marketConditionLabels } from '@/lib/constants';
import { formatCurrency, formatDate } from '@/lib/formatters';

export default function JournalPage() {
  const { trades, journalEntries, addJournalEntry, updateJournalEntry } = useTrades();
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const [form, setForm] = useState({
    date: new Date().toISOString().split('T')[0],
    mood: 'notr' as DayMood,
    preMarketNotes: '',
    postMarketNotes: '',
    lessonsLearned: '',
    marketCondition: 'yatay' as 'yukselis' | 'dusus' | 'yatay',
  });

  const dailyPnLMap = useMemo(() => {
    const map = new Map<string, number>();
    trades.filter(t => t.exitDate != null && t.pnl !== null).forEach(t => {
      const d = (t.exitDate as string).split('T')[0];
      map.set(d, (map.get(d) || 0) + (t.pnl ?? 0));
    });
    return map;
  }, [trades]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      updateJournalEntry(editId, { ...form, tradeIds: [] });
    } else {
      addJournalEntry({ ...form, tradeIds: [] });
    }
    setShowForm(false);
    setEditId(null);
    setForm({ date: new Date().toISOString().split('T')[0], mood: 'notr' as DayMood, preMarketNotes: '', postMarketNotes: '', lessonsLearned: '', marketCondition: 'yatay' as const });
  };

  const startEdit = (entry: JournalEntry) => {
    setEditId(entry.id);
    setForm({
      date: entry.date,
      mood: entry.mood,
      preMarketNotes: entry.preMarketNotes,
      postMarketNotes: entry.postMarketNotes,
      lessonsLearned: entry.lessonsLearned,
      marketCondition: entry.marketCondition,
    });
    setShowForm(true);
  };

  const update = (field: string, value: string) => setForm(prev => ({ ...prev, [field]: value }));

  // Calendar data for current month
  const now = new Date();
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [viewYear, setViewYear] = useState(now.getFullYear());

  const calendarDays = useMemo(() => {
    const firstDay = new Date(viewYear, viewMonth, 1);
    const lastDay = new Date(viewYear, viewMonth + 1, 0);
    const startOffset = (firstDay.getDay() + 6) % 7; // Monday start
    const days: { date: string; day: number; inMonth: boolean; pnl: number | null; hasEntry: boolean }[] = [];

    for (let i = 0; i < startOffset; i++) {
      days.push({ date: '', day: 0, inMonth: false, pnl: null, hasEntry: false });
    }

    for (let d = 1; d <= lastDay.getDate(); d++) {
      const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const pnl = dailyPnLMap.get(dateStr) ?? null;
      const hasEntry = journalEntries.some(e => e.date === dateStr);
      days.push({ date: dateStr, day: d, inMonth: true, pnl, hasEntry });
    }

    return days;
  }, [viewMonth, viewYear, dailyPnLMap, journalEntries]);

  const monthNames = ['Ocak', 'Subat', 'Mart', 'Nisan', 'Mayis', 'Haziran', 'Temmuz', 'Agustos', 'Eylul', 'Ekim', 'Kasim', 'Aralik'];

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-text-primary">Trading Gunlugu</h1>
        <button
          onClick={() => { setShowForm(true); setEditId(null); }}
          className="inline-flex items-center gap-2 bg-accent-primary hover:bg-accent-hover text-bg-primary font-semibold px-5 py-2.5 rounded-lg transition-all"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Yeni Giris
        </button>
      </div>

      {/* Calendar */}
      <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5">
        <div className="flex items-center justify-between mb-4">
          <button onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }} className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
          </button>
          <h3 className="text-lg font-semibold text-text-primary">{monthNames[viewMonth]} {viewYear}</h3>
          <button onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }} className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-7 gap-1.5">
          {['Pzt', 'Sal', 'Car', 'Per', 'Cum', 'Cmt', 'Paz'].map(d => (
            <div key={d} className="text-center text-xs text-text-muted py-2 font-medium">{d}</div>
          ))}
          {calendarDays.map((day, i) => {
            if (!day.inMonth) return <div key={i} />;
            const bg = day.pnl !== null
              ? day.pnl > 0 ? 'bg-profit/15 border-profit/30' : 'bg-loss/15 border-loss/30'
              : 'bg-bg-tertiary/30 border-bg-quaternary/30';
            return (
              <div
                key={i}
                className={`aspect-square rounded-lg border ${bg} flex flex-col items-center justify-center cursor-pointer hover:border-accent-primary/50 transition-colors relative`}
                title={day.pnl !== null ? `${day.date}: ${formatCurrency(day.pnl)}` : day.date}
              >
                <span className="text-xs text-text-primary">{day.day}</span>
                {day.pnl !== null && (
                  <span className={`text-[8px] font-tabular ${day.pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                    {day.pnl >= 0 ? '+' : ''}{day.pnl.toFixed(0)}
                  </span>
                )}
                {day.hasEntry && (
                  <div className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-accent-primary" />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Journal Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-bg-secondary border border-bg-quaternary rounded-xl p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto animate-fade-in">
            <h3 className="text-lg font-bold text-text-primary mb-4">{editId ? 'Girisi Duzenle' : 'Yeni Gunluk Girisi'}</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Tarih</label>
                <input type="date" value={form.date} onChange={e => update('date', e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary" />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Ruh Hali</label>
                <div className="flex gap-2">
                  {(Object.keys(moodEmojis) as DayMood[]).map(mood => (
                    <button key={mood} type="button" onClick={() => update('mood', mood)}
                      className={`flex-1 py-2.5 rounded-lg text-center transition-all ${
                        form.mood === mood ? 'bg-accent-primary/20 border border-accent-primary/50' : 'bg-bg-tertiary border border-bg-quaternary'
                      }`}
                    >
                      <span className="text-lg">{moodEmojis[mood]}</span>
                      <p className="text-[10px] text-text-muted mt-0.5">{moodLabels[mood]}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Piyasa Durumu</label>
                <div className="grid grid-cols-3 gap-2">
                  {(Object.entries(marketConditionLabels) as [string, string][]).map(([k, v]) => (
                    <button key={k} type="button" onClick={() => update('marketCondition', k)}
                      className={`py-2 rounded-lg text-sm transition-all ${
                        form.marketCondition === k ? 'bg-accent-primary/20 border border-accent-primary/50 text-accent-primary' : 'bg-bg-tertiary border border-bg-quaternary text-text-muted'
                      }`}
                    >
                      {k === 'yukselis' ? '📈' : k === 'dusus' ? '📉' : '➡️'} {v}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Piyasa Oncesi Notlar</label>
                <textarea value={form.preMarketNotes} onChange={e => update('preMarketNotes', e.target.value)} rows={3}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary resize-none"
                  placeholder="Piyasa acilmadan onceki dusunceleriniz..." />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Gun Sonu Degerlendirmesi</label>
                <textarea value={form.postMarketNotes} onChange={e => update('postMarketNotes', e.target.value)} rows={3}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary resize-none"
                  placeholder="Gunun nasil gecti?" />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Alinan Dersler</label>
                <textarea value={form.lessonsLearned} onChange={e => update('lessonsLearned', e.target.value)} rows={2}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary resize-none"
                  placeholder="Bugun ne ogrendiniz?" />
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" onClick={() => { setShowForm(false); setEditId(null); }}
                  className="px-4 py-2 text-sm rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors">
                  Iptal
                </button>
                <button type="submit"
                  className="px-4 py-2 text-sm rounded-lg bg-accent-primary hover:bg-accent-hover text-bg-primary font-semibold transition-all">
                  {editId ? 'Guncelle' : 'Kaydet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Journal Entries */}
      <div className="space-y-4">
        {journalEntries.length === 0 ? (
          <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-12 text-center">
            <svg className="w-12 h-12 text-text-muted/30 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            <p className="text-text-muted text-sm">Henuz gunluk girisi yok</p>
            <p className="text-text-muted/60 text-xs mt-1">Ilk gunluk girisinizi ekleyin</p>
          </div>
        ) : (
          journalEntries.map(entry => {
            const pnl = dailyPnLMap.get(entry.date);
            return (
              <div key={entry.id} className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-5 card-hover cursor-pointer" onClick={() => startEdit(entry)}>
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{moodEmojis[entry.mood]}</span>
                    <div>
                      <p className="text-sm font-semibold text-text-primary">{formatDate(entry.date)}</p>
                      <p className="text-xs text-text-muted">{marketConditionLabels[entry.marketCondition]} Piyasa</p>
                    </div>
                  </div>
                  {pnl !== undefined && (
                    <span className={`text-sm font-bold font-tabular ${pnl >= 0 ? 'text-profit' : 'text-loss'}`}>
                      {pnl >= 0 ? '+' : ''}{formatCurrency(pnl)}
                    </span>
                  )}
                </div>
                {entry.preMarketNotes && (
                  <p className="text-sm text-text-secondary mb-2"><span className="text-text-muted">Oncesi:</span> {entry.preMarketNotes}</p>
                )}
                {entry.postMarketNotes && (
                  <p className="text-sm text-text-secondary mb-2"><span className="text-text-muted">Sonrasi:</span> {entry.postMarketNotes}</p>
                )}
                {entry.lessonsLearned && (
                  <p className="text-sm text-accent-primary/80"><span className="text-text-muted">Ders:</span> {entry.lessonsLearned}</p>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
