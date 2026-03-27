import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import type { TransferHistory } from '@/types/wallet';

export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { data: entries, error } = await supabase
    .from('ledger_entries')
    .select(`
      id,
      amount,
      asset,
      timestamp,
      status,
      reference,
      internal_transfer
    `)
    .eq('internal_transfer', true)
    .gte('timestamp', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
    .order('timestamp', { ascending: false })
    .limit(10);

  if (error) {
    console.error('Fetch transfers error:', error);
    return NextResponse.json({ error: 'Failed to fetch transfers' }, { status: 500 });
  }

  const history: TransferHistory[] = entries?.map(e => ({
    id: e.id,
    from: e.reference?.includes('to_you') ? 'Someone' : 'You',
    to: e.reference?.includes('to_you') ? 'You' : 'Someone',
    amount: Math.abs(Number(e.amount)),
    currency: e.asset,
    date: new Date(e.timestamp).toISOString().split('T')[0],
    status: e.status as 'completed' | 'pending'
  })) || [];

  return NextResponse.json(history);
}

