import { createClient } from '@/lib/supabase/server';
import Link from 'next/link';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

type SupportTicket = {
  id: number;
  reference_id: string;
  subject: string;
  status: string;
  category: string;
  user_id: string;
  updated_at: string;
  open_at: string;
};

export default async function AdminSupportPage() {
  const supabase = await createClient();

  const { data: { user } } = await supabase.auth.getUser();

  if (!user || !user.email?.includes('admin')) {
    return <div>Not authorized</div>;
  }

  const { data: tickets } = await supabase
    .from('support_tickets')
    .select('*')
    .in('status', ['open', 'pending'])
    .order('updated_at', { ascending: false });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Live Support Chats</h1>
        <Link href="/admin/dashboard">
          <Button variant="outline">Dashboard</Button>
        </Link>
      </div>

      {tickets && tickets.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3>No open chats</h3>
            <p>Users will appear here when they create tickets.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {tickets?.map((ticket: SupportTicket) => (
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
