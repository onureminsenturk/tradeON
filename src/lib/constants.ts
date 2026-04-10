import { AssetType, TradeDirection, DayMood } from '@/types/trade';

export const assetTypeLabels: Record<AssetType, string> = {
  hisse: 'Hisse Senedi',
  forex: 'Forex',
  kripto: 'Kripto',
  emtia: 'Emtia',
  endeks: 'Endeks',
  opsiyon: 'Opsiyon',
  vadeli: 'Vadeli Islem',
};

export const directionLabels: Record<TradeDirection, string> = {
  long: 'Long',
  short: 'Short',
};

export const moodLabels: Record<DayMood, string> = {
  harika: 'Harika',
  iyi: 'Iyi',
  notr: 'Notr',
  kotu: 'Kotu',
  berbat: 'Berbat',
};

export const moodEmojis: Record<DayMood, string> = {
  harika: '🤩',
  iyi: '😊',
  notr: '😐',
  kotu: '😟',
  berbat: '😫',
};

export const marketConditionLabels = {
  yukselis: 'Yukselis',
  dusus: 'Dusus',
  yatay: 'Yatay',
};

export const accountTypeLabels: Record<string, string> = {
  funded: 'Funded Hesap',
  kripto: 'Kripto Hesap',
  kisisel: 'Kisisel Hesap',
  demo: 'Demo Hesap',
  diger: 'Diger',
};

export const accountColors = [
  '#06b6d4', '#8b5cf6', '#f59e0b', '#ec4899', '#10b981', '#f97316',
  '#3b82f6', '#ef4444', '#14b8a6', '#a855f7',
];

export const currencySymbols: Record<string, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};
