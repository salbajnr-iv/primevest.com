'use client';
import { useState, useEffect, useCallback } from 'react';
import { getQuote, type QuoteResult } from './get-quote';

export function useQuote(symbol: string): {
  quote: QuoteResult | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refetch = useCallback(async () => {
    if (!symbol) {
      setQuote(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const result = await getQuote(symbol);
      setQuote(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quote');
    } finally {
      setLoading(false);
    }
  }, [symbol]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { quote, loading, error, refetch };
}
