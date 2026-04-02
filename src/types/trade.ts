export type AssetType = 'hisse' | 'forex' | 'kripto' | 'emtia' | 'endeks' | 'opsiyon' | 'vadeli';

export type TradeDirection = 'long' | 'short';

export type TradeStatus = 'acik' | 'kapali';

export type DayMood = 'harika' | 'iyi' | 'notr' | 'kotu' | 'berbat';

export interface Trade {
  id: string;
  userId: string;
  symbol: string;
  assetType: AssetType;
  direction: TradeDirection;
  status: TradeStatus;
  entryPrice: number;
  exitPrice: number | null;
  quantity: number;
  riskAmount: number | null;
  commission: number;
  pnl: number | null;
  pnlPercent: number | null;
  beforeChart: string | null;
  afterChart: string | null;
  beforeLink: string | null;
  afterLink: string | null;
  entryDate: string;
  exitDate: string | null;
  strategy: string;
  notes: string;
  tags: string[];
  rating: 1 | 2 | 3 | 4 | 5;
  createdAt: string;
  updatedAt: string;
}

export type TransactionType = 'deposit' | 'withdrawal';

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  note: string;
  date: string;
  createdAt: string;
}

export interface JournalEntry {
  id: string;
  userId: string;
  date: string;
  mood: DayMood;
  preMarketNotes: string;
  postMarketNotes: string;
  lessonsLearned: string;
  marketCondition: 'yukselis' | 'dusus' | 'yatay';
  tradeIds: string[];
  createdAt: string;
  updatedAt: string;
}
