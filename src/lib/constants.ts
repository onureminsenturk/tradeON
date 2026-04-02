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

export const currencySymbols: Record<string, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
};
