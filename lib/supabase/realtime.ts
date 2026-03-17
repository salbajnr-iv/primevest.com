import { useEffect, useState, useCallback } from 'react';
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

export type { RealtimeReply };

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
