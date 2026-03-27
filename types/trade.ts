export interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

export interface RecentTrade {
  time: string;
  price: number;
  amount: number;
  side: 'buy' | 'sell';
}

export interface PortfolioAsset {
  symbol: string;
  name: string;
  holdings: number;
  value: number;
  change: number;
}

export interface MockTrade { // Legacy - remove after migration
  id: string;
  symbol: string;
  type: 'buy' | 'sell';
  amount: number;
  price: number;
  status: 'open' | 'closed';
  time: string;
}

