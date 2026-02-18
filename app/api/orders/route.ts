import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
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

    // Check and verify order amount doesn't exceed user balance
    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('balance')
      .eq('id', userId)
      .maybeSingle()

    if (profileErr || !profileData) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    const totalAmount = parseFloat(String(total))
    const balanceAmount = parseFloat(String(profileData.balance))

    if (side === 'buy' && totalAmount > balanceAmount) {
      return NextResponse.json(
        { error: 'Insufficient balance for this order' },
        { status: 400 }
      )
    }

    // Create the order in the database
    const { data: orderData, error: orderErr } = await supabase
      .from('orders')
      .insert([
        {
          user_id: userId,
          side,
          asset,
          amount: parseFloat(String(amount)),
          price: price ? parseFloat(String(price)) : null,
          total: totalAmount,
          order_type: orderType || 'market',
          status: 'pending',
          created_at: new Date().toISOString(),
        },
      ])
      .select()
      .single()

    if (orderErr || !orderData) {
      return NextResponse.json(
        { error: 'Failed to create order', details: String(orderErr) },
        { status: 500 }
      )
    }

    // Log admin action for tracking
    await supabase.from('admin_actions').insert([
      {
        admin_id: userId,
        action_type: 'order_created',
        target_user_id: userId,
        target_table: 'orders',
        new_value: JSON.stringify({
          order_id: orderData.id,
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
        id: orderData.id,
        side: orderData.side,
        asset: orderData.asset,
        amount: orderData.amount,
        price: orderData.price,
        total: orderData.total,
        status: orderData.status,
        created_at: orderData.created_at,
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
