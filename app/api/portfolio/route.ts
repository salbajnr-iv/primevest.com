import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { PortfolioAsset } from '@/types/trade';

export async function GET() {
  const supabase = await createClient();

  // Join balances + assets metadata (assume assets table exists)
  const { data: balances, error: balanceError } = await supabase
    .from('balances')
    .select(`
      asset,
      available
    `)
    .gte('available', 0.001);

  if (balanceError) {
    console.error('Portfolio fetch error:', balanceError);
    return NextResponse.json({ error: 'Failed to fetch portfolio' }, { status: 500 });
  }

  // Mock asset metadata - replace with real 'assets' table query
  const assetMeta: Record<string, { name: string; symbol: string }> = {
    BTC: { name: 'Bitcoin', symbol: 'BTC' },
    ETH: { name: 'Ethereum', symbol: 'ETH' },
    SOL: { name: 'Solana', symbol: 'SOL' },
    USDT: { name: 'USDT', symbol: 'USDT' }
  };

  const portfolio: PortfolioAsset[] = balances?.map((b: { asset: string; available: string | number }) => {
    const meta = assetMeta[b.asset] || { name: b.asset, symbol: b.asset };
    // Fetch current price from /api/prices/${b.asset} or external API later
    const value = Number(b.available) * 65000; // Mock BTC price etc.
    return {
      symbol: meta.symbol,
      name: meta.name,
      holdings: Number(b.available),
      value,
      change: Math.random() * 10 - 5 // Mock change
    };
  }) || [];

  return NextResponse.json(portfolio);
}
