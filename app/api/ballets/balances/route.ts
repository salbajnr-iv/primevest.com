import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { SupportedCurrency } from '@/types/wallet';

export async function GET() {
  const supabase = await createClient();

  const { data: balances, error } = await supabase
    .from('balances')
    .select('asset, available, locked');

  if (error) {
    console.error('Fetch balances error:', error);
    return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 });
  }

  const balanceMap = balances?.reduce((acc: Record<SupportedCurrency, number>, b: { asset: SupportedCurrency; available: string | number }) => {
    acc[b.asset] = Number(b.available);
    return acc;
  }, { EUR: 0, BTC: 0, ETH: 0, USDT: 0 }) || {
    EUR: 0,
    BTC: 0,
    ETH: 0,
    USDT: 0
  };

  return NextResponse.json(balanceMap);
}

