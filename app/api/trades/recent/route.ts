import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { RecentTrade } from '@/types/trade';
import { apiRouteError, logRouteError } from '@/lib/api/route-errors';

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
    const code = 'RECENT_TRADES_UNAVAILABLE';
    logRouteError({
      route: 'trades/recent',
      pair,
      timestamp: new Date().toISOString(),
      code,
      error,
    });

    return apiRouteError(503, code, 'Recent trade data is temporarily unavailable.');
  }

  const recentTrades: RecentTrade[] = trades?.map((t) => ({
    time: new Date(t.created_at).toLocaleTimeString(),
    price: Number(t.price),
    amount: Number(t.amount),
    side: t.side as 'buy' | 'sell',
  })) || [];

  return NextResponse.json(recentTrades);
}
