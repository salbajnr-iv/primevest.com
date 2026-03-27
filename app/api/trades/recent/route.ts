import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import type { RecentTrade } from '@/types/trade';

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const pair = url.searchParams.get('pair') || 'BTC/EUR';

  const { data: trades, error } = await supabase
    .from('trades')
    .select('id, price, amount, side, created_at')
    .eq('pair', pair)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Recent trades error:', error);
    // Fallback mock for demo
    return NextResponse.json([
      { time: 'now', price: 65000, amount: 0.01, side: 'buy' as const },
      { time: '1m ago', price: 64950, amount: 0.02, side: 'sell' as const }
    ]);
  }

  const recentTrades: RecentTrade[] = trades?.map((t: any) => ({
    time: new Date(t.created_at).toLocaleTimeString(),
    price: Number(t.price),
    amount: Number(t.amount),
    side: t.side as 'buy' | 'sell'
  })) || [];

  return NextResponse.json(recentTrades);
}

