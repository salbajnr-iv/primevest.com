"use client"

import * as React from 'react';
import { useTicketRealtime } from '@/lib/supabase/realtime';
import { MessageList, ChatInput } from '@/components/ui';
import { createClient } from '@/lib/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface Props {
  params: { id: string };
}

interface TicketData {
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
  const supabase = createClient();
  const [ticket, setTicket] = React.useState<TicketData | null>(null);
  const [userProfile, setUserProfile] = React.useState<{ full_name?: string; email?: string; avatar_url?: string; } | null>(null);

  React.useEffect(() => {
    async function loadTicket() {
      if (!supabase) return;
      const { data } = await supabase
        .from('support_tickets')
        .select('*, profiles(*)')
        .eq('id', ticketId)
        .single();

      if (data) {
        setTicket(data);
        setUserProfile(data.profiles);
      }
    }
    loadTicket();
  }, [ticketId, supabase]);

  const { messages, sendMessage } = useTicketRealtime(ticketId);
  const adminSend = (msg: string) => sendMessage(msg, true); // admin is_staff = true

  if (!ticket) return <div>Loading...</div>;
  if (!supabase) return <div>No Supabase client</div>;

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
            <AvatarFallback>{userProfile?.full_name?.slice(0,2) || 'U'}</AvatarFallback>
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
        <MessageList messages={messages} currentUserId={currentUserId} />
        <ChatInput onSend={adminSend} placeholder="Reply to user..." />
      </div>
    </div>
  );
}
