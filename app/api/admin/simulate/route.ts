import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { target_user_id, operations } = body || {}

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
    }

    if (!target_user_id || !operations || !Array.isArray(operations)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Validate caller is admin: get user from token
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 })
    }

    const adminId = userData.user.id

    const { data: profileData, error: profileErr } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', adminId)
      .maybeSingle()

    if (profileErr) {
      return NextResponse.json({ error: 'Failed to verify admin status' }, { status: 500 })
    }

    if (!profileData || profileData.is_admin !== true) {
      return NextResponse.json({ error: 'Forbidden: not an admin' }, { status: 403 })
    }

    const results: any[] = []

    for (const op of operations) {
      try {
        if (op.type === 'deposit') {
          // Use existing RPC to adjust balance if available
          const { error: adjErr } = await supabase.rpc('adjust_balance', {
            p_user_id: target_user_id,
            p_action_type: 'add',
            p_amount: parseFloat(op.amount) || 0,
            p_reason: op.reason || 'Simulation: deposit by admin'
          })

          // log admin action
          await supabase.from('admin_actions').insert([{ admin_id: adminId, action_type: 'simulate_deposit', target_user_id, target_table: 'profiles', new_value: JSON.stringify({ amount: op.amount, reason: op.reason }) }])

          results.push({ op, success: !adjErr, error: adjErr?.message })
          continue
        }

        if (op.type === 'withdraw') {
          const { error: adjErr } = await supabase.rpc('adjust_balance', {
            p_user_id: target_user_id,
            p_action_type: 'subtract',
            p_amount: parseFloat(op.amount) || 0,
            p_reason: op.reason || 'Simulation: withdraw by admin'
          })

          await supabase.from('admin_actions').insert([{ admin_id: adminId, action_type: 'simulate_withdraw', target_user_id, target_table: 'profiles', new_value: JSON.stringify({ amount: op.amount, reason: op.reason }) }])

          results.push({ op, success: !adjErr, error: adjErr?.message })
          continue
        }

        if (op.type === 'transaction') {
          // Insert a fake transaction
          const insertPayload = {
            user_id: target_user_id,
            type: op.txType || 'trade',
            amount: parseFloat(op.amount) || 0,
            currency: op.currency || 'EUR',
            status: 'completed',
            description: op.description || 'Simulated transaction',
            reference_id: op.reference_id || `SIM-${Date.now()}`,
            metadata: op.metadata || {}
          }

          const { error: txErr } = await supabase.from('transactions').insert([insertPayload])

          await supabase.from('admin_actions').insert([{ admin_id: adminId, action_type: 'simulate_transaction', target_user_id, target_table: 'transactions', new_value: JSON.stringify(insertPayload) }])

          results.push({ op, success: !txErr, error: txErr?.message })
          continue
        }

        if (op.type === 'notify') {
          // Optional: try to insert into notifications table if it exists
          try {
            const payload = {
              user_id: target_user_id,
              title: op.title || 'Simulated notification',
              body: op.body || 'This notification was simulated by admin',
              read: false,
            }
            const { error: nErr } = await supabase.from('notifications').insert([payload])
            await supabase.from('admin_actions').insert([{ admin_id: adminId, action_type: 'simulate_notification', target_user_id, target_table: 'notifications', new_value: JSON.stringify(payload) }])
            results.push({ op, success: !nErr, error: nErr?.message })
            continue
          } catch (e) {
            results.push({ op, success: false, error: 'Notifications table not available or failed' })
            continue
          }
        }

        results.push({ op, success: false, error: 'Unknown operation' })
      } catch (innerErr) {
        results.push({ op, success: false, error: (innerErr as any)?.message || String(innerErr) })
      }
    }

    return NextResponse.json({ ok: true, results })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 })
  }
}
