import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import type { Tables } from '@/types/supabase';
import type { RecentTrade } from '@/types/trade';

type TradeRow = Tables<'trades'>;

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const pair = url.searchParams.get('pair');

  if (!pair) {
    return NextResponse.json({ error: 'Missing required query parameter: pair' }, { status: 400 });
  }

  const { data: trades, error } = await supabase
    .from('trades')
    .select('id, price, amount, side, created_at')
    .eq('pair', pair)
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Recent trades error:', error);
    return NextResponse.json({ error: 'Failed to fetch recent trades.' }, { status: 500 });
  }

  const recentTrades: RecentTrade[] = ((trades ?? []) as TradeRow[]).map((trade) => ({
    time: new Date(trade.created_at).toLocaleTimeString('de-DE', { hour12: false }),
    price: Number(trade.price),
    amount: Number(trade.amount),
    side: trade.side as 'buy' | 'sell',
  }));

  return NextResponse.json(recentTrades);
}
