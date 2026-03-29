import { cache } from 'react';
import type { MarketFreshnessState } from './freshness';

export interface QuoteResult {
  priceEur: number;
  timestamp: string;
  freshness: MarketFreshnessState;
  ageSeconds: number;
  source: string;
}

export const getQuote = cache(async (symbol: string): Promise<QuoteResult | null> => {
  const response = await fetch(`\$/api/market/quote/\${symbol}?symbol=\${symbol}`, {
    cache: 'no-store',
  });
  if (!response.ok) return null;
  const data = await response.json();
  return data.quote || null;
});
