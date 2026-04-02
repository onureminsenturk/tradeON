import { AssetType } from '@/types/trade';

interface SymbolInfo {
  symbol: string;
  name: string;
  type: AssetType;
}

export const popularSymbols: SymbolInfo[] = [
  // Forex Major
  { symbol: 'EUR/USD', name: 'Euro / US Dollar', type: 'forex' },
  { symbol: 'GBP/USD', name: 'British Pound / US Dollar', type: 'forex' },
  { symbol: 'USD/JPY', name: 'US Dollar / Japanese Yen', type: 'forex' },
  { symbol: 'USD/CHF', name: 'US Dollar / Swiss Franc', type: 'forex' },
  { symbol: 'AUD/USD', name: 'Australian Dollar / US Dollar', type: 'forex' },
  { symbol: 'USD/CAD', name: 'US Dollar / Canadian Dollar', type: 'forex' },
  { symbol: 'NZD/USD', name: 'New Zealand Dollar / US Dollar', type: 'forex' },
  // Forex Cross
  { symbol: 'EUR/GBP', name: 'Euro / British Pound', type: 'forex' },
  { symbol: 'EUR/JPY', name: 'Euro / Japanese Yen', type: 'forex' },
  { symbol: 'GBP/JPY', name: 'British Pound / Japanese Yen', type: 'forex' },
  { symbol: 'EUR/CHF', name: 'Euro / Swiss Franc', type: 'forex' },
  { symbol: 'AUD/JPY', name: 'Australian Dollar / Japanese Yen', type: 'forex' },
  { symbol: 'GBP/CHF', name: 'British Pound / Swiss Franc', type: 'forex' },
  { symbol: 'EUR/AUD', name: 'Euro / Australian Dollar', type: 'forex' },
  { symbol: 'EUR/CAD', name: 'Euro / Canadian Dollar', type: 'forex' },
  { symbol: 'GBP/AUD', name: 'British Pound / Australian Dollar', type: 'forex' },
  { symbol: 'GBP/CAD', name: 'British Pound / Canadian Dollar', type: 'forex' },
  { symbol: 'AUD/CAD', name: 'Australian Dollar / Canadian Dollar', type: 'forex' },
  { symbol: 'AUD/CHF', name: 'Australian Dollar / Swiss Franc', type: 'forex' },
  { symbol: 'NZD/JPY', name: 'New Zealand Dollar / Japanese Yen', type: 'forex' },
  { symbol: 'CAD/JPY', name: 'Canadian Dollar / Japanese Yen', type: 'forex' },
  { symbol: 'CHF/JPY', name: 'Swiss Franc / Japanese Yen', type: 'forex' },
  { symbol: 'USD/TRY', name: 'US Dollar / Turkish Lira', type: 'forex' },
  { symbol: 'EUR/TRY', name: 'Euro / Turkish Lira', type: 'forex' },
  { symbol: 'GBP/TRY', name: 'British Pound / Turkish Lira', type: 'forex' },
  { symbol: 'USD/MXN', name: 'US Dollar / Mexican Peso', type: 'forex' },
  { symbol: 'USD/ZAR', name: 'US Dollar / South African Rand', type: 'forex' },
  { symbol: 'USD/SGD', name: 'US Dollar / Singapore Dollar', type: 'forex' },
  { symbol: 'USD/HKD', name: 'US Dollar / Hong Kong Dollar', type: 'forex' },
  { symbol: 'USD/NOK', name: 'US Dollar / Norwegian Krone', type: 'forex' },
  { symbol: 'USD/SEK', name: 'US Dollar / Swedish Krona', type: 'forex' },
  { symbol: 'USD/DKK', name: 'US Dollar / Danish Krone', type: 'forex' },

  // Commodities / Emtia
  { symbol: 'XAU/USD', name: 'Altin / US Dollar', type: 'emtia' },
  { symbol: 'XAG/USD', name: 'Gumus / US Dollar', type: 'emtia' },
  { symbol: 'BRENT', name: 'Brent Petrol', type: 'emtia' },
  { symbol: 'WTI', name: 'WTI Ham Petrol', type: 'emtia' },
  { symbol: 'NGAS', name: 'Dogalgaz', type: 'emtia' },
  { symbol: 'COPPER', name: 'Bakir', type: 'emtia' },
  { symbol: 'PLATINUM', name: 'Platin', type: 'emtia' },
  { symbol: 'PALLADIUM', name: 'Paladyum', type: 'emtia' },
  { symbol: 'WHEAT', name: 'Bugday', type: 'emtia' },
  { symbol: 'CORN', name: 'Misir', type: 'emtia' },
  { symbol: 'COTTON', name: 'Pamuk', type: 'emtia' },
  { symbol: 'COFFEE', name: 'Kahve', type: 'emtia' },
  { symbol: 'SUGAR', name: 'Seker', type: 'emtia' },

  // Indices / Endeksler
  { symbol: 'US30', name: 'Dow Jones 30', type: 'endeks' },
  { symbol: 'US500', name: 'S&P 500', type: 'endeks' },
  { symbol: 'US100', name: 'Nasdaq 100', type: 'endeks' },
  { symbol: 'DE40', name: 'DAX 40 (Almanya)', type: 'endeks' },
  { symbol: 'UK100', name: 'FTSE 100 (Ingiltere)', type: 'endeks' },
  { symbol: 'JP225', name: 'Nikkei 225 (Japonya)', type: 'endeks' },
  { symbol: 'XU100', name: 'BIST 100 (Turkiye)', type: 'endeks' },
  { symbol: 'XU030', name: 'BIST 30 (Turkiye)', type: 'endeks' },
  { symbol: 'FR40', name: 'CAC 40 (Fransa)', type: 'endeks' },
  { symbol: 'EU50', name: 'Euro Stoxx 50', type: 'endeks' },
  { symbol: 'HK50', name: 'Hang Seng 50', type: 'endeks' },
  { symbol: 'AUS200', name: 'ASX 200 (Avustralya)', type: 'endeks' },

  // Crypto
  { symbol: 'BTC/USDT', name: 'Bitcoin', type: 'kripto' },
  { symbol: 'ETH/USDT', name: 'Ethereum', type: 'kripto' },
  { symbol: 'BNB/USDT', name: 'Binance Coin', type: 'kripto' },
  { symbol: 'SOL/USDT', name: 'Solana', type: 'kripto' },
  { symbol: 'XRP/USDT', name: 'Ripple', type: 'kripto' },
  { symbol: 'ADA/USDT', name: 'Cardano', type: 'kripto' },
  { symbol: 'DOGE/USDT', name: 'Dogecoin', type: 'kripto' },
  { symbol: 'DOT/USDT', name: 'Polkadot', type: 'kripto' },
  { symbol: 'AVAX/USDT', name: 'Avalanche', type: 'kripto' },
  { symbol: 'MATIC/USDT', name: 'Polygon', type: 'kripto' },
  { symbol: 'LINK/USDT', name: 'Chainlink', type: 'kripto' },
  { symbol: 'UNI/USDT', name: 'Uniswap', type: 'kripto' },
  { symbol: 'ATOM/USDT', name: 'Cosmos', type: 'kripto' },
  { symbol: 'LTC/USDT', name: 'Litecoin', type: 'kripto' },
  { symbol: 'FTM/USDT', name: 'Fantom', type: 'kripto' },
  { symbol: 'NEAR/USDT', name: 'NEAR Protocol', type: 'kripto' },
  { symbol: 'APT/USDT', name: 'Aptos', type: 'kripto' },
  { symbol: 'ARB/USDT', name: 'Arbitrum', type: 'kripto' },
  { symbol: 'OP/USDT', name: 'Optimism', type: 'kripto' },
  { symbol: 'SUI/USDT', name: 'Sui', type: 'kripto' },
  { symbol: 'PEPE/USDT', name: 'Pepe', type: 'kripto' },
  { symbol: 'WIF/USDT', name: 'dogwifhat', type: 'kripto' },

  // Turkish Stocks / BIST
  { symbol: 'THYAO', name: 'Turk Hava Yollari', type: 'hisse' },
  { symbol: 'GARAN', name: 'Garanti Bankasi', type: 'hisse' },
  { symbol: 'AKBNK', name: 'Akbank', type: 'hisse' },
  { symbol: 'EREGL', name: 'Eregli Demir Celik', type: 'hisse' },
  { symbol: 'SISE', name: 'Turkiye Sise', type: 'hisse' },
  { symbol: 'KCHOL', name: 'Koc Holding', type: 'hisse' },
  { symbol: 'SAHOL', name: 'Sabanci Holding', type: 'hisse' },
  { symbol: 'ASELS', name: 'Aselsan', type: 'hisse' },
  { symbol: 'BIMAS', name: 'BIM Magazalar', type: 'hisse' },
  { symbol: 'TUPRS', name: 'Tupras', type: 'hisse' },
  { symbol: 'YKBNK', name: 'Yapi Kredi Bankasi', type: 'hisse' },
  { symbol: 'ISCTR', name: 'Is Bankasi', type: 'hisse' },
  { symbol: 'PGSUS', name: 'Pegasus', type: 'hisse' },
  { symbol: 'SASA', name: 'SASA Polyester', type: 'hisse' },
  { symbol: 'TAVHL', name: 'TAV Havalimanlari', type: 'hisse' },
  { symbol: 'TCELL', name: 'Turkcell', type: 'hisse' },
  { symbol: 'TTKOM', name: 'Turk Telekom', type: 'hisse' },
  { symbol: 'FROTO', name: 'Ford Otosan', type: 'hisse' },
  { symbol: 'TOASO', name: 'Tofas Oto Fab.', type: 'hisse' },
  { symbol: 'HALKB', name: 'Halkbank', type: 'hisse' },
  { symbol: 'VAKBN', name: 'Vakifbank', type: 'hisse' },
  { symbol: 'KOZAL', name: 'Koza Altin', type: 'hisse' },
  { symbol: 'EKGYO', name: 'Emlak Konut GYO', type: 'hisse' },
  { symbol: 'ARCLK', name: 'Arcelik', type: 'hisse' },
  { symbol: 'PETKM', name: 'Petkim', type: 'hisse' },
  { symbol: 'DOHOL', name: 'Dogan Holding', type: 'hisse' },

  // US Stocks
  { symbol: 'AAPL', name: 'Apple', type: 'hisse' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'hisse' },
  { symbol: 'GOOGL', name: 'Alphabet (Google)', type: 'hisse' },
  { symbol: 'AMZN', name: 'Amazon', type: 'hisse' },
  { symbol: 'NVDA', name: 'NVIDIA', type: 'hisse' },
  { symbol: 'META', name: 'Meta (Facebook)', type: 'hisse' },
  { symbol: 'TSLA', name: 'Tesla', type: 'hisse' },
  { symbol: 'AMD', name: 'AMD', type: 'hisse' },
  { symbol: 'NFLX', name: 'Netflix', type: 'hisse' },
  { symbol: 'DIS', name: 'Disney', type: 'hisse' },
  { symbol: 'BA', name: 'Boeing', type: 'hisse' },
  { symbol: 'JPM', name: 'JP Morgan', type: 'hisse' },
  { symbol: 'V', name: 'Visa', type: 'hisse' },
  { symbol: 'MA', name: 'Mastercard', type: 'hisse' },
  { symbol: 'COIN', name: 'Coinbase', type: 'hisse' },
];

export function searchSymbols(query: string, assetType?: AssetType): SymbolInfo[] {
  const q = query.toUpperCase().trim();
  if (!q) return [];

  let results = popularSymbols.filter(
    s => s.symbol.toUpperCase().includes(q) || s.name.toUpperCase().includes(q)
  );

  if (assetType) {
    // Show matching type first, then others
    const typed = results.filter(s => s.type === assetType);
    const others = results.filter(s => s.type !== assetType);
    results = [...typed, ...others];
  }

  return results.slice(0, 8);
}
