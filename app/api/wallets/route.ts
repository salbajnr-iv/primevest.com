import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: wallets, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', user.id)
      .order('asset', { ascending: true })

    if (error) {
      console.error('Wallets fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch wallets' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, wallets })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { asset } = body

    if (!asset) {
      return NextResponse.json({ error: 'Asset symbol is required' }, { status: 400 })
    }

    // Check if wallet already exists
    const { data: existing } = await supabase
      .from('wallets')
      .select('id')
      .eq('user_id', user.id)
      .eq('asset', asset.toUpperCase())
      .maybeSingle()

    if (existing) {
      return NextResponse.json({ error: 'Wallet already exists for this asset' }, { status: 409 })
    }

    const { data: newWallet, error } = await supabase
      .from('wallets')
      .insert([{
        user_id: user.id,
        asset: asset.toUpperCase(),
        balance: 0,
        available_balance: 0,
        locked_balance: 0,
        status: 'active'
      }])
      .select()
      .single()

    if (error) {
      console.error('Wallet creation error:', error)
      return NextResponse.json({ error: 'Failed to create wallet' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, wallet: newWallet })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
