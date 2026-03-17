import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getLatestPrices } from '@/lib/market/service'

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json(
        { error: 'Trading is unavailable right now.' },
        { status: 503 }
      )
    }

    const body = await req.json()
    const { side, asset, amount, price, total, orderType } = body

    if (!side || !asset || !amount || !total) {
      return NextResponse.json(
        { error: 'Missing required fields: side, asset, amount, total' },
        { status: 400 }
      )
    }

    if (!['buy', 'sell'].includes(side)) {
      return NextResponse.json(
        { error: 'Invalid side. Must be "buy" or "sell"' },
        { status: 400 }
      )
    }

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      )
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    })

    // Verify user token
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json(
        { error: 'Invalid auth token' },
        { status: 401 }
      )
    }

    const latestPrice = !price && asset
      ? (await getLatestPrices([String(asset)])).find((row) => row.asset === String(asset).toUpperCase())
      : null

    const { data: rpcData, error: rpcErr } = await supabase.rpc('create_order_atomic', {
      p_side: side,
      p_asset: asset,
      p_amount: Number(amount),
      p_price: price ? Number(price) : latestPrice?.priceEur ?? null,
      p_total: Number(total),
      p_order_type: orderType || 'market',
    })

    if (rpcErr) {
      return NextResponse.json(
        { error: 'Failed to create order', details: String(rpcErr.message || rpcErr) },
        { status: 500 }
      )
    }

    const result = Array.isArray(rpcData) ? rpcData[0] : rpcData
    if (!result?.success) {
      const status = result?.code === 'INSUFFICIENT_FUNDS' ? 400 : 422
      return NextResponse.json(
        { error: result?.message || 'Failed to create order', code: result?.code || 'ORDER_FAILED' },
        { status }
      )
    }

    // Log admin action for tracking
    await supabase.from('admin_actions').insert([
      {
        admin_id: userData.user.id,
        action_type: 'order_created',
        target_user_id: userData.user.id,
        target_table: 'orders',
        new_value: JSON.stringify({
          order_id: result.order_id,
          side,
          asset,
          amount,
          total,
        }),
      },
    ])

    return NextResponse.json({
      ok: true,
      order: {
        id: result.order_id,
        side,
        asset,
        amount: Number(amount),
        price: price ? Number(price) : latestPrice?.priceEur ?? null,
        total: Number(total),
        status: 'pending',
      },
      transaction_id: result.transaction_id,
      balance: {
        before: result.balance_before,
        after: result.balance_after,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Unexpected error', details: String(err) },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json(
        { error: 'Missing authorization token' },
        { status: 401 }
      )
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verify user token
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json(
        { error: 'Invalid auth token' },
        { status: 401 }
      )
    }

    const userId = userData.user.id

    // Get user's orders
    const { data: orders, error: ordersErr } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(50)

    if (ordersErr) {
      return NextResponse.json(
        { error: 'Failed to fetch orders' },
        { status: 500 }
      )
    }

    return NextResponse.json({ ok: true, orders: orders || [] })
  } catch (err) {
    return NextResponse.json(
      { error: 'Unexpected error', details: String(err) },
      { status: 500 }
    )
  }
}
