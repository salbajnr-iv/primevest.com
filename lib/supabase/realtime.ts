import { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import { useCallback, useEffect, useState } from 'react';
import { createClient } from './client';

interface RealtimeReply {
  id: number;
  ticket_id: number;
  user_id: string;
  message: string;
  is_staff: boolean;
  created_at: string;
  seen_at: string | null;
  [key: string]: unknown;
}

type RealtimePayload<T extends Record<string, unknown>> = RealtimePostgresChangesPayload<T>;

function isValidRow<T extends Record<string, unknown>>(row: unknown): row is T {
  if (!row || typeof row !== 'object' || row === null || Array.isArray(row)) {
    return false;
  }
  return Object.keys(row).length > 0;
}

interface MarketPriceRealtimeRow {
  asset: string;
  last_price: number;
  source: string;
  status: 'live' | 'delayed' | 'stale';
  priced_at: string;
  [key: string]: unknown;
}

interface OrderStatusRealtimeRow {
  id: string | number;
  status: string;
  updated_at: string;
  [key: string]: unknown;
}

interface SupportTicketRealtimeRow {
  id: number;
  status: string;
  updated_at: string;
  reference_id?: string;
  [key: string]: unknown;
}

interface BalanceRealtimeRow {
  wallet_id: string;
  user_id: string;
  asset: string;
  balance: number;
  updated_at: string;
  [key: string]: unknown;
}

interface LedgerRealtimeRow {
  id: string;
  wallet_id: string;
  amount: number;
  type: string;
  created_at: string;
  [key: string]: unknown;
}

interface BalanceHistoryRealtimeRow {
  id: string;
  user_id: string;
  action_type: string;
  amount: number;
  created_at: string;
  [key: string]: unknown;
}

export type { RealtimeReply, MarketPriceRealtimeRow, OrderStatusRealtimeRow, SupportTicketRealtimeRow, BalanceRealtimeRow, LedgerRealtimeRow, BalanceHistoryRealtimeRow };

export function useBalanceHistoryRealtime(onEntryInsert: (row: BalanceHistoryRealtimeRow) => void) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('realtime:balance-history')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'balance_history',
        },
        (payload: RealtimePayload<BalanceHistoryRealtimeRow>) => {
          const row = payload.new;
          if (isValidRow<BalanceHistoryRealtimeRow>(row)) {
            onEntryInsert(row);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onEntryInsert]);
}

export function useBalanceRealtime(onBalanceUpdate: (row: BalanceRealtimeRow) => void, userId?: string) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime:balances${userId ? `-${userId}` : ''}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'balances',
          ...(userId ? { filter: `user_id=eq.${userId}` } : {}),
        },
        (payload: RealtimePayload<BalanceRealtimeRow>) => {
          const row = payload.new;
          if (isValidRow<BalanceRealtimeRow>(row)) {
            onBalanceUpdate(row);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onBalanceUpdate, userId]);
}

export function useLedgerRealtime(onEntryInsert: (row: LedgerRealtimeRow) => void, walletId?: string) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime:ledger${walletId ? `-${walletId}` : ''}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'ledger_entries',
          ...(walletId ? { filter: `wallet_id=eq.${walletId}` } : {}),
        },
        (payload: RealtimePayload<LedgerRealtimeRow>) => {
          const row = payload.new;
          if (isValidRow<LedgerRealtimeRow>(row)) {
            onEntryInsert(row);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onEntryInsert, walletId]);
}

export function useSupportTicketRepliesRealtime(onReplyInsert: (row: RealtimeReply) => void, ticketId?: number) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel(`realtime:support-ticket-replies${ticketId ? `-${ticketId}` : ''}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_ticket_replies',
          ...(ticketId ? { filter: `ticket_id=eq.${ticketId}` } : {}),
        },
        (payload: RealtimePayload<RealtimeReply>) => {
          const row = payload.new;
          if (isValidRow<RealtimeReply>(row)) {
            onReplyInsert(row);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onReplyInsert, ticketId]);
}

export function useMarketPriceRealtime(onPriceUpdate: (row: MarketPriceRealtimeRow) => void, assets?: string[]) {
  useEffect(() => {
    const supabase = createClient();
    const normalizedAssets = assets?.map((asset) => asset.toUpperCase());

    const channel = supabase
      .channel('realtime:market-prices')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_prices',
        },
        (payload: RealtimePayload<MarketPriceRealtimeRow>) => {
          const row = payload.new;
          const asset = row.asset.toUpperCase();
          if (!isValidRow<MarketPriceRealtimeRow>(row) || (normalizedAssets?.length && !normalizedAssets.includes(asset))) {
            return;
          }
          onPriceUpdate({ 
            asset, 
            last_price: row.last_price, 
            source: row.source, 
            status: row.status, 
            priced_at: row.priced_at 
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onPriceUpdate, assets]);
}

export function useOrderStatusRealtime(onOrderUpdate: (row: OrderStatusRealtimeRow) => void) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('realtime:orders-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload: RealtimePayload<OrderStatusRealtimeRow>) => {
          const row = payload.new;
          if (isValidRow<OrderStatusRealtimeRow>(row)) {
            onOrderUpdate(row);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onOrderUpdate]);
}

export function useSupportTicketStatusRealtime(onTicketUpdate: (row: SupportTicketRealtimeRow) => void) {
  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel('realtime:support-tickets')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
        },
        (payload: RealtimePayload<SupportTicketRealtimeRow>) => {
          const row = payload.new;
          if (isValidRow<SupportTicketRealtimeRow>(row)) {
            onTicketUpdate(row);
          }
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [onTicketUpdate]);
}

export function useTicketRealtime(ticketId: number | null, initialMessages: RealtimeReply[] = []) {
  const [messages, setMessages] = useState<RealtimeReply[]>(initialMessages);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!ticketId) return;

    const supabase = createClient();

    const channel = supabase
      .channel(`realtime:ticket-${ticketId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'support_ticket_replies',
          filter: `ticket_id=eq.${ticketId}`,
        },
        (payload: RealtimePayload<RealtimeReply>) => {
          const newReply = payload.new;
          if (isValidRow<RealtimeReply>(newReply)) {
            setMessages((prev) => [...prev, newReply]);
          }
        }
      )
      .subscribe((status: string) => {
        if (status === 'SUBSCRIBED') setLoading(false);
      });

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [ticketId]);

  const sendMessage = useCallback(
    async (message: string, isStaff = false): Promise<void> => {
      if (!ticketId) return;

      const supabase = createClient();
  
      const {
        data: { user },
      } = await supabase.auth.getUser();
      const userId = user?.id || 'anonymous';

      const optimistic: RealtimeReply = {
        id: Date.now(),
        ticket_id: ticketId,
        user_id: userId,
        message,
        is_staff: isStaff,
        created_at: new Date().toISOString(),
        seen_at: null,
      };
      setMessages((prev) => [...prev, optimistic]);

      const { error } = await supabase.from('support_ticket_replies').insert({
        ticket_id: ticketId,
        user_id: userId,
        message,
        is_staff: isStaff,
      });

      if (error) {
        setMessages((prev) => prev.filter((m, index) => index !== prev.length - 1));
        console.error('Send failed:', error);
      }
    },
    [ticketId]
  );

  return { messages, sendMessage, loading };
}
