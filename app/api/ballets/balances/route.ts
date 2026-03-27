import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { WalletBalance } from '@/types/wallet';

export async function GET(request: Request) {
  const supabase = createClient();
  
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: balances, error } = await supabase
    .from('wallet_balances')
    .select('*')
    .eq('user_id', user.id)
    .order('currency');

  if (error) {
    console.error('Balances error:', error);
    return NextResponse.json({ error: 'Failed to fetch balances' }, { status: 500 });
  }

  return NextResponse.json(balances || []);
}
