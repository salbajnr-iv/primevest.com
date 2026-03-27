"use client";

import * as React from 'react';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns';
import { createClient } from '@/lib/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface SupportTicket {
  id: number;
  reference_id: string;
  subject: string;
  status: string;
  category: string;
  user_id: string;
  updated_at: string;
  open_at: string;
}

export default function AdminSupportPage() {
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const loadTickets = async () => {
      const supabase = createClient();

      const activeStatuses = ['open', 'pending'];
      const { data } = await supabase
        .from('support_tickets')
        .select('*')
        .in('status', activeStatuses)
        .order('updated_at', { ascending: false });

      setTickets((data as SupportTicket[]) || []);
      setLoading(false);
    };

    loadTickets();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Live Support Chats</h1>
        <Link href="/admin/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
      </div>

      {tickets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3>No open chats</h3>
            <p>Users will appear here when they create tickets.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tickets.map((ticket) => (
            <Link key={ticket.id} href={`/admin/support/${ticket.id}`} className="block">
              <Card>
                <CardHeader>
                  <CardTitle className="font-normal text-lg">
                    #{ticket.reference_id} {ticket.subject}
                  </CardTitle>
                  <CardDescription>
                    {ticket.category} • {ticket.status.toUpperCase()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    Updated {formatDistanceToNow(new Date(ticket.updated_at))}
                  </p>
                  <Button className="mt-2 w-full" variant="outline">Open Chat</Button>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
