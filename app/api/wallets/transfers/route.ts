import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { TransferHistory } from '@/types/wallet';

export async function GET(req: NextRequest) {
  const supabase = await createClient();
  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit')) || 10;
  const offset = Number(searchParams.get('offset')) || 0;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Query user's transfer history (sent + received)
  const { data: transfers, error } = await supabase
    .from('transfers')
    .select(`
      *,
      profiles!from_profile_id (full_name, email),
      profiles!to_profile_id (full_name, email)
    `)
    .or(`from_profile_id.eq.${user.id},to_profile_id.eq.${user.id}`)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (error) {
    console.error('Fetch transfers error:', error);
    // Fallback empty history
    return NextResponse.json([]);
  }

  const history: TransferHistory[] = transfers?.map(t => ({
    id: t.id,
    from: t.from_profile?.full_name || t.from_profile?.email?.split('@')[0] || 'You',
    to: t.to_profile?.full_name || t.to_profile?.email?.split('@')[0] || 'You',
    amount: Number(t.amount),
    currency: t.currency as string,
    date: new Date(t.created_at).toLocaleDateString(),
    status: t.status as 'completed' | 'pending'
  })) || [];

  return NextResponse.json(history);
}
