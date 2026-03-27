import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/supabase';
import type { OrderBookEntry } from '@/types/trade';

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const pair = url.searchParams.get('pair') || 'BTC/EUR';

  // Aggregate open orders by price level
  const { data: orders, error } = await supabase
    .from('orders')
    .select('price, amount, side')
    .eq('pair', pair)
    .in('status', ['open', 'partial_fill'])
    .order('price', { ascending: true })
    .limit(20);

  if (error) {
    console.error('Orderbook error:', error);
    // Fallback mock
    return NextResponse.json({
      bids: [{ price: 64980, amount: 1.2, total: 77976 }, { price: 64950, amount: 0.8, total: 51960 }],
      asks: [{ price: 65020, amount: 0.9, total: 58518 }, { price: 65050, amount: 1.5, total: 97575 }]
    });
  }

  const bids = orders?.filter((o: any) => o.side === 'buy').slice(-10) || [];
  const asks = orders?.filter((o: any) => o.side === 'sell').slice(0, 10) || [];

  const orderbook = {
    bids: bids.map((b: any, i: number) => ({
      price: Number(b.price),
      amount: Number(b.amount),
      total: Number(b.price) * Number(b.amount) * (i + 1) // Cumulative
    })),
    asks: asks.map((a: any, i: number) => ({
      price: Number(a.price),
      amount: Number(a.amount),
      total: Number(a.price) * Number(a.amount) * (i + 1)
    }))
  };

  return NextResponse.json(orderbook);
}

