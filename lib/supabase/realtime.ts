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
}

interface MarketPriceRealtimeRow {
  asset: string;
  last_price: number;
  source: string;
  status: 'live' | 'delayed' | 'stale';
  priced_at: string;
}

interface OrderStatusRealtimeRow {
  id: string | number;
  status: string;
  updated_at: string;
}

interface SupportTicketRealtimeRow {
  id: number;
  status: string;
  updated_at: string;
  reference_id?: string;
}

export type { RealtimeReply, MarketPriceRealtimeRow, OrderStatusRealtimeRow, SupportTicketRealtimeRow };

export function useSupportTicketRepliesRealtime(onReplyInsert: (row: RealtimeReply) => void, ticketId?: number) {
  useEffect(() => {
    const supabase = createClient();
    if (!supabase) return;

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
        (payload) => {
          const row = payload.new as RealtimeReply;
          onReplyInsert(row);
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
    if (!supabase) return;

    const channel = supabase
      .channel('realtime:market-prices')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'market_prices',
        },
        (payload) => {
          const row = payload.new as MarketPriceRealtimeRow;
          if (assets?.length && !assets.includes(String(row.asset).toUpperCase())) {
            return;
          }
          onPriceUpdate({ ...row, asset: String(row.asset).toUpperCase() });
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
    if (!supabase) return;

    const channel = supabase
      .channel('realtime:orders-status')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const row = payload.new as OrderStatusRealtimeRow;
          onOrderUpdate(row);
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
    if (!supabase) return;

    const channel = supabase
      .channel('realtime:support-tickets')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'support_tickets',
        },
        (payload) => {
          const row = payload.new as SupportTicketRealtimeRow;
          onTicketUpdate(row);
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
    if (!supabase) return;

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
        (payload) => {
          const newReply = payload.new as RealtimeReply;
          setMessages((prev) => [...prev, newReply]);
        }
      )
      .subscribe((status) => {
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
      if (!supabase) return;

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
        setMessages((prev) => prev.slice(0, -1));
        console.error('Send failed:', error);
      }
    },
    [ticketId]
  );

  return { messages, sendMessage, loading };
}