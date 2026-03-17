"use client";

import * as React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { createClient } from '@/lib/supabase/client';
import { useSupportTicketRepliesRealtime, useSupportTicketStatusRealtime, useTicketRealtime, type RealtimeReply } from '@/lib/supabase/realtime';
import { MessageList, ChatInput } from '@/components/ui';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';

interface Props {
  params: { id: string };
}

interface TicketData {
  id: number;
  subject: string;
  updated_at: string;
  profiles: {
    full_name?: string;
    email?: string;
    avatar_url?: string;
  } | null;
}

export default function AdminChatPage({ params }: Props) {
  const ticketId = Number(params.id);
  const [ticket, setTicket] = React.useState<TicketData | null>(null);
  const [userProfile, setUserProfile] = React.useState<{ full_name?: string; email?: string; avatar_url?: string } | null>(null);
  const [initialMessages, setInitialMessages] = React.useState<RealtimeReply[]>([]);

  const loadTicket = React.useCallback(async () => {
    const supabase = createClient();
    if (!supabase || !ticketId) return;

    const { data } = await supabase
      .from('support_tickets')
      .select('id, subject, updated_at, profiles(*)')
      .eq('id', ticketId)
      .single();

    if (data) {
      setTicket(data as TicketData);
      setUserProfile((data as TicketData).profiles);
    }
  }, [ticketId]);

  const loadMessages = React.useCallback(async () => {
    const supabase = createClient();
    if (!supabase || !ticketId) return;

    const { data } = await supabase
      .from('support_ticket_replies')
      .select('*')
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    setInitialMessages((data as RealtimeReply[]) || []);
  }, [ticketId]);

  React.useEffect(() => {
    void loadTicket();
    void loadMessages();
  }, [loadMessages, loadTicket]);

  const { messages, sendMessage } = useTicketRealtime(ticketId);

  const mergedMessages = React.useMemo(() => {
    const byKey = new Map<string, RealtimeReply>();

    for (const message of initialMessages) {
      byKey.set(String(message.id), message);
    }

    for (const message of messages) {
      byKey.set(String(message.id), message);
    }

    return [...byKey.values()].sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
  }, [initialMessages, messages]);
  const adminSend = (msg: string) => sendMessage(msg, true);

  useSupportTicketStatusRealtime((updatedTicket) => {
    if (updatedTicket.id !== ticketId) return;
    setTicket((current) =>
      current
        ? {
            ...current,
            updated_at: updatedTicket.updated_at,
          }
        : current
    );
  });

  useSupportTicketRepliesRealtime((reply) => {
    if (reply.ticket_id !== ticketId) return;
    void loadTicket();
  }, ticketId);

  if (!ticket) return <div>Loading...</div>;

  const currentUserId = 'admin';

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Link href="/admin/support">
          <Button variant="ghost">← Back to chats</Button>
        </Link>
        <div className="flex items-center gap-2">
          <Avatar className="h-10 w-10">
            <AvatarImage src={userProfile?.avatar_url} />
            <AvatarFallback>{userProfile?.full_name?.slice(0, 2) || 'U'}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{ticket.subject}</p>
            <p className="text-sm text-muted-foreground">{userProfile?.full_name || userProfile?.email}</p>
          </div>
          <span className="text-sm text-muted-foreground">
            {formatDistanceToNow(new Date(ticket.updated_at))}
          </span>
        </div>
      </div>

      <div className="h-[600px] border rounded-lg flex flex-col overflow-hidden">
        <MessageList messages={mergedMessages} currentUserId={currentUserId} />
        <ChatInput onSend={adminSend} placeholder="Reply to user..." />
      </div>
    </div>
  );
}
