import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

type PositionResponse = {
  ok: true;
  data: Array<{
    id: string;
    symbol: string;
    name: string;
    type: 'buy' | 'sell';
    volume: number;
    openPrice: number;
    currentPrice: number;
    profit: number;
    profitPercent: number;
  }>;
} | {
  ok: false;
  error: string;
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ ok: false, error: 'User ID required' } as PositionResponse, { status: 400 });
    }

    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user || user.id !== userId) {
      return NextResponse.json({ ok: false, error: 'Unauthorized' } as PositionResponse, { status: 401 });
    }

    // Fetch recent orders for positions
    const { data: orders, error: ordersError } = await supabase
      .from('orders')
      .select(`
        id,
        symbol,
        order_type,
        total_amount,
        price,
        created_at
      `)
      .eq('user_id', userId)
      .gte('created_at', new Date(Date.now() - 30*24*60*60*1000).toISOString()) // Last 30 days
      .order('created_at', { ascending: false })
      .limit(20);

    if (ordersError) throw ordersError;

    // Fetch current prices
    const symbols = [...new Set(orders?.map(o => o.symbol).filter(Boolean) ?? [])];
    const { data: prices, error: pricesError } = await supabase
      .from('market_prices')
      .select('asset, last_price')
      .in('asset', symbols)
      .order('priced_at', { ascending: false });

    if (pricesError) throw pricesError;

    const priceMap = new Map(prices?.map(p => [p.asset, Number(p.last_price)]) ?? []);

    const positions = (orders ?? []).map(order => {
      const currentPrice = Number(priceMap.get(order.symbol ?? '')) || Number(order.price);
      const openPrice = Number(order.price) || currentPrice;
      const volume = Number(order.total_amount) / openPrice;
      const profit = (currentPrice - openPrice) * volume;
      const profitPercent = ((currentPrice - openPrice) / openPrice) * 100;

      return {
        id: order.id,
        symbol: order.symbol ?? 'N/A',
        name: order.symbol ?? 'Unknown',
        type: (order.order_type as 'buy' | 'sell') || 'buy',
        volume: volume,
        openPrice: openPrice,
        currentPrice: currentPrice,
        profit: profit,
        profitPercent: profitPercent,
      };
    });

    return NextResponse.json({ ok: true, data: positions } as PositionResponse);

  } catch (error) {
    console.error('[positions-api]', error);
    return NextResponse.json({ 
      ok: false, 
      error: 'Failed to fetch positions' 
    } as PositionResponse, { status: 500 });
  }
}

