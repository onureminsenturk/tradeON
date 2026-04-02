'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTrades } from '@/context/TradeContext';
import { AssetType, TradeDirection } from '@/types/trade';
import { assetTypeLabels } from '@/lib/constants';
import { formatCurrency } from '@/lib/formatters';
import { searchSymbols } from '@/lib/symbols';

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function NewTradePage() {
  const router = useRouter();
  const { addTrade } = useTrades();

  const [form, setForm] = useState({
    symbol: '',
    assetType: 'kripto' as AssetType,
    direction: 'long' as TradeDirection,
    entryPrice: '',
    exitPrice: '',
    quantity: '',
    riskAmount: '',
    commission: '0',
    strategy: '',
    notes: '',
    tags: '',
    rating: 3 as 1 | 2 | 3 | 4 | 5,
    entryDate: new Date().toISOString().slice(0, 16),
    exitDate: '',
  });

  const [beforeChart, setBeforeChart] = useState<string | null>(null);
  const [afterChart, setAfterChart] = useState<string | null>(null);
  const [beforeLink, setBeforeLink] = useState('');
  const [afterLink, setAfterLink] = useState('');
  const [error, setError] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<ReturnType<typeof searchSymbols>>([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(-1);
  const symbolRef = useRef<HTMLDivElement>(null);
  const beforeRef = useRef<HTMLInputElement>(null);
  const afterRef = useRef<HTMLInputElement>(null);

  const handleSymbolChange = (value: string) => {
    update('symbol', value);
    const results = searchSymbols(value, form.assetType);
    setSuggestions(results);
    setShowSuggestions(results.length > 0 && value.length > 0);
    setSelectedSuggestion(-1);
  };

  const selectSymbol = (symbol: string, type: AssetType) => {
    update('symbol', symbol);
    update('assetType', type);
    setShowSuggestions(false);
    setSelectedSuggestion(-1);
  };

  const handleSymbolKeyDown = (e: React.KeyboardEvent) => {
    if (!showSuggestions) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestion(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && selectedSuggestion >= 0) {
      e.preventDefault();
      const s = suggestions[selectedSuggestion];
      selectSymbol(s.symbol, s.type);
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  // Close suggestions on click outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (symbolRef.current && !symbolRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const previewPnL = () => {
    const entry = parseFloat(form.entryPrice);
    const exit = parseFloat(form.exitPrice);
    const qty = parseFloat(form.quantity);
    const comm = parseFloat(form.commission) || 0;
    if (!entry || !exit || !qty) return null;
    const mult = form.direction === 'long' ? 1 : -1;
    const pnl = (exit - entry) * qty * mult - comm;
    return pnl;
  };

  const pnlPreview = previewPnL();

  const handleImageUpload = async (file: File, setter: (v: string | null) => void) => {
    if (file.size > 2 * 1024 * 1024) {
      setError('Gorsel boyutu 2MB\'dan kucuk olmali.');
      return;
    }
    const base64 = await fileToBase64(file);
    setter(base64);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.symbol || !form.entryPrice || !form.quantity) {
      setError('Sembol, giris fiyati ve miktar zorunludur.');
      return;
    }

    addTrade({
      symbol: form.symbol.toUpperCase(),
      assetType: form.assetType,
      direction: form.direction,
      status: form.exitPrice ? 'kapali' : 'acik',
      entryPrice: parseFloat(form.entryPrice),
      exitPrice: form.exitPrice ? parseFloat(form.exitPrice) : null,
      quantity: parseFloat(form.quantity),
      riskAmount: form.riskAmount ? parseFloat(form.riskAmount) : null,
      commission: parseFloat(form.commission) || 0,
      beforeChart,
      afterChart,
      beforeLink: beforeLink.trim() || null,
      afterLink: afterLink.trim() || null,
      entryDate: new Date(form.entryDate).toISOString(),
      exitDate: form.exitDate ? new Date(form.exitDate).toISOString() : null,
      strategy: form.strategy,
      notes: form.notes,
      tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [],
      rating: form.rating,
    });

    router.push('/islemler');
  };

  const update = (field: string, value: string | number) => setForm(prev => ({ ...prev, [field]: value }));

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-bg-tertiary text-text-muted hover:text-text-primary transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
          </svg>
        </button>
        <h1 className="text-2xl font-bold text-text-primary">Yeni Islem</h1>
      </div>

      {error && (
        <div className="bg-loss/10 border border-loss/30 text-loss rounded-lg p-3 text-sm">{error}</div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Trade Data */}
          <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-6 space-y-4">
            <h2 className="text-lg font-semibold text-text-primary mb-2">Islem Bilgileri</h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1 relative" ref={symbolRef}>
                <label className="block text-sm text-text-secondary mb-1.5">Sembol *</label>
                <input
                  type="text"
                  value={form.symbol}
                  onChange={e => handleSymbolChange(e.target.value)}
                  onFocus={() => { if (form.symbol) handleSymbolChange(form.symbol); }}
                  onKeyDown={handleSymbolKeyDown}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors uppercase"
                  placeholder="EUR/USD, BTC..."
                  autoComplete="off"
                />
                {showSuggestions && (
                  <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-bg-secondary border border-bg-quaternary rounded-lg shadow-xl overflow-hidden max-h-64 overflow-y-auto">
                    {suggestions.map((s, i) => (
                      <button
                        key={s.symbol}
                        type="button"
                        onClick={() => selectSymbol(s.symbol, s.type)}
                        className={`w-full text-left px-4 py-2.5 flex items-center justify-between transition-colors ${
                          i === selectedSuggestion
                            ? 'bg-accent-primary/10 text-accent-primary'
                            : 'hover:bg-bg-tertiary text-text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-semibold text-sm font-tabular">{s.symbol}</span>
                          <span className="text-xs text-text-muted">{s.name}</span>
                        </div>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-bg-quaternary/50 text-text-muted">
                          {assetTypeLabels[s.type]}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="col-span-2 sm:col-span-1">
                <label className="block text-sm text-text-secondary mb-1.5">Varlik Turu</label>
                <select
                  value={form.assetType}
                  onChange={e => update('assetType', e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                >
                  {Object.entries(assetTypeLabels).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Direction */}
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Yon</label>
              <div className="grid grid-cols-2 gap-2">
                {(['long', 'short'] as const).map(dir => (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => update('direction', dir)}
                    className={`py-2.5 rounded-lg text-sm font-semibold transition-all ${
                      form.direction === dir
                        ? dir === 'long'
                          ? 'bg-profit/20 text-profit border border-profit/50'
                          : 'bg-loss/20 text-loss border border-loss/50'
                        : 'bg-bg-tertiary text-text-muted border border-bg-quaternary hover:border-text-muted'
                    }`}
                  >
                    {dir === 'long' ? '↑ Long' : '↓ Short'}
                  </button>
                ))}
              </div>
            </div>

            {/* Prices */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Giris Fiyati *</label>
                <input
                  type="number"
                  step="any"
                  value={form.entryPrice}
                  onChange={e => update('entryPrice', e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary font-tabular focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Cikis Fiyati</label>
                <input
                  type="number"
                  step="any"
                  value={form.exitPrice}
                  onChange={e => update('exitPrice', e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary font-tabular focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="Bos = Acik"
                />
              </div>
            </div>

            {/* Risk Amount */}
            <div>
              <label className="block text-sm text-text-secondary mb-1.5">Risk Miktari ($)</label>
              <input
                type="number"
                step="any"
                value={form.riskAmount}
                onChange={e => update('riskAmount', e.target.value)}
                className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary font-tabular focus:outline-none focus:border-accent-primary transition-colors"
                placeholder="orn: 100"
              />
              <p className="text-xs text-text-muted mt-1">Bu islemde riske ettiginiz tutar</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Lot *</label>
                <input
                  type="number"
                  step="any"
                  value={form.quantity}
                  onChange={e => update('quantity', e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary font-tabular focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="0.01"
                />
                <p className="text-xs text-text-muted mt-1">
                  {form.assetType === 'forex'
                    ? '1 Lot = 100.000 birim'
                    : form.assetType === 'emtia'
                    ? '1 Lot = 10.000 birim'
                    : 'Islem miktari / adedi'}
                </p>
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Komisyon</label>
                <input
                  type="number"
                  step="any"
                  value={form.commission}
                  onChange={e => update('commission', e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary font-tabular focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="0"
                />
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Giris Tarihi</label>
                <input
                  type="datetime-local"
                  value={form.entryDate}
                  onChange={e => update('entryDate', e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Cikis Tarihi</label>
                <input
                  type="datetime-local"
                  value={form.exitDate}
                  onChange={e => update('exitDate', e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary focus:outline-none focus:border-accent-primary transition-colors"
                />
              </div>
            </div>

            {/* PnL Preview */}
            {pnlPreview !== null && (
              <div className={`p-4 rounded-lg border ${pnlPreview >= 0 ? 'bg-profit/5 border-profit/30' : 'bg-loss/5 border-loss/30'}`}>
                <p className="text-xs text-text-muted mb-1">Tahmini K/Z</p>
                <p className={`text-2xl font-bold font-tabular ${pnlPreview >= 0 ? 'text-profit' : 'text-loss'}`}>
                  {pnlPreview >= 0 ? '+' : ''}{formatCurrency(pnlPreview)}
                </p>
              </div>
            )}
          </div>

          {/* Right Column - Charts & Journal */}
          <div className="space-y-6">
            {/* Before / After Charts */}
            <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-text-primary mb-2">Grafik Ekran Goruntuleri</h2>

              <div className="grid grid-cols-2 gap-4">
                {/* Before Chart */}
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Giris Oncesi</label>
                  <input
                    ref={beforeRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleImageUpload(f, setBeforeChart);
                    }}
                  />
                  {beforeChart ? (
                    <div className="relative group">
                      <img src={beforeChart} alt="Before" className="w-full h-32 object-cover rounded-lg border border-bg-quaternary" />
                      <button
                        type="button"
                        onClick={() => { setBeforeChart(null); if (beforeRef.current) beforeRef.current.value = ''; }}
                        className="absolute top-1 right-1 w-6 h-6 bg-loss/80 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => beforeRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-bg-quaternary rounded-lg flex flex-col items-center justify-center gap-2 text-text-muted hover:border-accent-primary hover:text-accent-primary transition-colors"
                    >
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                      <span className="text-xs">Before Chart</span>
                    </button>
                  )}
                </div>

                {/* After Chart */}
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5">Cikis Sonrasi</label>
                  <input
                    ref={afterRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={e => {
                      const f = e.target.files?.[0];
                      if (f) handleImageUpload(f, setAfterChart);
                    }}
                  />
                  {afterChart ? (
                    <div className="relative group">
                      <img src={afterChart} alt="After" className="w-full h-32 object-cover rounded-lg border border-bg-quaternary" />
                      <button
                        type="button"
                        onClick={() => { setAfterChart(null); if (afterRef.current) afterRef.current.value = ''; }}
                        className="absolute top-1 right-1 w-6 h-6 bg-loss/80 rounded-full flex items-center justify-center text-white text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        ✕
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => afterRef.current?.click()}
                      className="w-full h-32 border-2 border-dashed border-bg-quaternary rounded-lg flex flex-col items-center justify-center gap-2 text-text-muted hover:border-accent-primary hover:text-accent-primary transition-colors"
                    >
                      <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909M3.75 21h16.5A2.25 2.25 0 0022.5 18.75V5.25A2.25 2.25 0 0020.25 3H3.75A2.25 2.25 0 001.5 5.25v13.5A2.25 2.25 0 003.75 21z" />
                      </svg>
                      <span className="text-xs">After Chart</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Links */}
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-bg-quaternary/30">
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-4.122a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.88" />
                    </svg>
                    Before Link
                  </label>
                  <input
                    type="url"
                    value={beforeLink}
                    onChange={e => setBeforeLink(e.target.value)}
                    className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                    placeholder="https://..."
                  />
                </div>
                <div>
                  <label className="block text-sm text-text-secondary mb-1.5 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m9.86-4.122a4.5 4.5 0 00-1.242-7.244l-4.5-4.5a4.5 4.5 0 00-6.364 6.364L4.757 8.88" />
                    </svg>
                    After Link
                  </label>
                  <input
                    type="url"
                    value={afterLink}
                    onChange={e => setAfterLink(e.target.value)}
                    className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-3 py-2 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>

            {/* Journal */}
            <div className="bg-bg-secondary border border-bg-quaternary/50 rounded-xl p-6 space-y-4">
              <h2 className="text-lg font-semibold text-text-primary mb-2">Gunluk Notlar</h2>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Strateji</label>
                <input
                  type="text"
                  value={form.strategy}
                  onChange={e => update('strategy', e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="Breakout, Trend Takip..."
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Notlar</label>
                <textarea
                  value={form.notes}
                  onChange={e => update('notes', e.target.value)}
                  rows={4}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors resize-none"
                  placeholder="Islem hakkinda notlariniz..."
                />
              </div>

              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Etiketler</label>
                <input
                  type="text"
                  value={form.tags}
                  onChange={e => update('tags', e.target.value)}
                  className="w-full bg-bg-tertiary border border-bg-quaternary rounded-lg px-4 py-2.5 text-text-primary placeholder-text-muted focus:outline-none focus:border-accent-primary transition-colors"
                  placeholder="virgul ile ayirin: swing, trend, scalp"
                />
              </div>

              {/* Rating */}
              <div>
                <label className="block text-sm text-text-secondary mb-1.5">Islem Degerlendirmesi</label>
                <div className="flex gap-2">
                  {([1, 2, 3, 4, 5] as const).map(r => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => update('rating', r)}
                      className={`w-10 h-10 rounded-lg text-sm font-bold transition-all ${
                        form.rating >= r
                          ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/50'
                          : 'bg-bg-tertiary text-text-muted border border-bg-quaternary'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit */}
        <div className="flex gap-3 justify-end mt-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-2.5 text-sm rounded-lg bg-bg-tertiary text-text-secondary hover:text-text-primary transition-colors"
          >
            Iptal
          </button>
          <button
            type="submit"
            className="px-6 py-2.5 text-sm rounded-lg bg-accent-primary hover:bg-accent-hover text-bg-primary font-semibold transition-all"
          >
            Islemi Kaydet
          </button>
        </div>
      </form>
    </div>
  );
}
