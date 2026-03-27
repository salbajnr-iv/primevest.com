
export type AssetCategory = "Crypto" | "Forex" | "Stocks" | "Commodities";

export interface HistoricalPoint {
  timestamp: string;
  price: number;
}

export interface MarketAsset {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  price: number;
  change24h: number;
  volume24h: string;
  marketCap: string;
  history: HistoricalPoint[];
}

export const MARKET_CATEGORIES: AssetCategory[] = ["Crypto", "Forex", "Stocks", "Commodities"];





export interface MarketStats {
  totalMarketCap: string;
  totalMarketCapChange: string;
  volume24h: string;
  volumeChange: string;
  btcDominance: string;
  btcDominanceChange: string;
  fearGreedIndex: number;
  fearGreedLabel: string;
}


