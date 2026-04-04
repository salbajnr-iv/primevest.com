import { useEffect, useState, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { PortfolioSummary } from '@/lib/dashboard/types';

const EMPTY_SUMMARY: PortfolioSummary = {
  userName: 'User',
  portfolioValue: 0,
  portfolioChangePct: 0,
  availableBalance: 0,
  availableBalanceChangePct: 0,
  notificationCount: 0,
};

export function usePortfolioSummary() {
  const { user } = useAuth();
  const [summary, setSummary] = useState<PortfolioSummary>(EMPTY_SUMMARY);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSummary = useCallback(async () => {
    if (!user?.id) {
      setSummary(EMPTY_SUMMARY);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClient();

      const [{ data: profile }, { count }] = await Promise.all([
        supabase.from('profiles').select('id, full_name, account_balance').eq('id', user.id).single(),
        supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
      ]);

      if (profile) {
        const userName = profile.full_name?.trim() || user.email?.split('@')[0] || 'User';
        const balance = Number(profile.account_balance ?? 0);
        setSummary({
          userName,
          portfolioValue: balance,
          availableBalance: balance,
          portfolioChangePct: 0, // Can integrate CoinGecko later
          availableBalanceChangePct: 0,
          notificationCount: count ?? 0,
        });
      } else {
        setSummary(EMPTY_SUMMARY);
      }
    } catch (err) {
      setError('Failed to fetch portfolio summary');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  useEffect(() => {
    if (!user?.id) return;

    const supabase = createClient();

    // Realtime profile balance changes
    const profileChannel = supabase
      .channel('profile-balance')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'profiles',
          filter: `id=eq.${user.id}`,
        },
        () => fetchSummary(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(profileChannel);
    };
  }, [user, fetchSummary]);

  return { summary, loading, error, refetch: fetchSummary };
}

