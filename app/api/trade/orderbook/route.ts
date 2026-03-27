import { NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const supabase = await createClient();
  const url = new URL(request.url);
  const pair = url.searchParams.get('pair');

  if (!pair) {
    return NextResponse.json({ error: 'Missing required query parameter: pair' }, { status: 400 });
  }

  const { data: orders, error } = await supabase
    .from('orders')
    .select('price, amount, side')
    .eq('pair', pair)
    .in('status', ['open', 'partial_fill'])
    .order('price', { ascending: true })
    .limit(200);

  if (error) {
    console.error('Orderbook error:', error);
    return NextResponse.json({ error: 'Failed to fetch order book.' }, { status: 500 });
  }

  const bidLevels = new Map<number, number>();
  const askLevels = new Map<number, number>();

  for (const order of orders ?? []) {
    const price = Number(order.price ?? 0);
    const amount = Number(order.amount ?? 0);

    if (!Number.isFinite(price) || !Number.isFinite(amount) || price <= 0 || amount <= 0) {
      continue;
    }

    if (order.side === 'buy') {
      bidLevels.set(price, (bidLevels.get(price) ?? 0) + amount);
    }

    if (order.side === 'sell') {
      askLevels.set(price, (askLevels.get(price) ?? 0) + amount);
    }
  }

  const bids = Array.from(bidLevels.entries())
    .sort((a, b) => b[0] - a[0])
    .slice(0, 10)
    .map(([price, amount], index, rows) => {
      const cumulativeAmount = rows.slice(0, index + 1).reduce((acc, entry) => acc + entry[1], 0);
      return {
        price,
        amount,
        total: price * cumulativeAmount,
      };
    });

  const asks = Array.from(askLevels.entries())
    .sort((a, b) => a[0] - b[0])
    .slice(0, 10)
    .map(([price, amount], index, rows) => {
      const cumulativeAmount = rows.slice(0, index + 1).reduce((acc, entry) => acc + entry[1], 0);
      return {
        price,
        amount,
        total: price * cumulativeAmount,
      };
    });

  return NextResponse.json({ bids, asks });
}
