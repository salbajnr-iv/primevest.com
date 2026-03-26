"use client";

import * as React from 'react';

export type Position = {
  id: string;
  symbol: string;
  name: string;
  type: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  currentPrice: number;
  profit: number;
  profitPercent: number;
};

export function usePositions(userId?: string) {
  const [positions, setPositions] = React.useState<Position[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!userId) {
      setPositions([]);
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    const fetchPositions = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch(`/api/dashboard/positions?userId=${encodeURIComponent(userId)}`, {
          credentials: 'include',
          cache: 'no-store',
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.json();
        if (isMounted && result.ok) {
          setPositions(result.data || []);
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load positions');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void fetchPositions();

    // Poll every 30s for updates
    const interval = setInterval(() => {
      if (isMounted) void fetchPositions();
    }, 30000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [userId]);

  return { positions, isLoading, error, refetch: () => {/* trigger refetch */} };
}

