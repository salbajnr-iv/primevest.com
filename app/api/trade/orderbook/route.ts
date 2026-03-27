import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { apiRouteError, logRouteError } from '@/lib/api/route-errors';

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const pair = url.searchParams.get('pair') || 'BTC/EUR';

  const { data: orders, error } = await supabase
    .from('orders')
    .select('price, amount, side')
    .eq('pair', pair)
    .in('status', ['open', 'partial_fill'])
    .order('price', { ascending: true })
    .limit(20);

  if (error) {
    const code = 'ORDERBOOK_UNAVAILABLE';
    logRouteError({
      route: 'trade/orderbook',
      pair,
      timestamp: new Date().toISOString(),
      code,
      error,
    });

    return apiRouteError(503, code, 'Order book data is temporarily unavailable.');
  }

  const bids = orders?.filter((o) => o.side === 'buy').slice(-10) || [];
  const asks = orders?.filter((o) => o.side === 'sell').slice(0, 10) || [];

  const orderbook = {
    bids: bids.map((b, i: number) => ({
      price: Number(b.price),
      amount: Number(b.amount),
      total: Number(b.price) * Number(b.amount) * (i + 1),
    })),
    asks: asks.map((a, i: number) => ({
      price: Number(a.price),
      amount: Number(a.amount),
      total: Number(a.price) * Number(a.amount) * (i + 1),
    })),
  };

  return NextResponse.json(orderbook);
}
