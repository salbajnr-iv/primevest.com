import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  const supabase = await createClient();

  const { data: assets, error } = await supabase
    .from('assets')
    .select('symbol, name, type')
    .eq('active', true)
    .order('name');

  if (error) {
    console.error('Fetch assets error:', error);
    // Fallback to minimal data if table missing
    return NextResponse.json([
      { symbol: 'BTC', name: 'Bitcoin', type: 'crypto' },
      { symbol: 'ETH', name: 'Ethereum', type: 'crypto' },
      { symbol: 'SOL', name: 'Solana', type: 'crypto' },
      { symbol: 'USDT', name: 'USDT', type: 'stablecoin' },
      { symbol: 'EUR', name: 'Euro', type: 'fiat' }
    ]);
  }

  return NextResponse.json(assets || []);
}

