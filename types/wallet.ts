export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

export interface TransferHistory {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  date: string;
  status: 'completed' | 'pending';
}

export interface WalletBalance {
  currency: string;
  available: number;
  locked: number;
}

export type SupportedCurrency = 'EUR' | 'BTC' | 'ETH' | 'USDT';

