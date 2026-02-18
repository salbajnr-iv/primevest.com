import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { request_id, status, reason } = body || {}

    if (!request_id || !status || !['verified', 'rejected','under_review'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 })
    }

    const adminId = userData.user.id
    const { data: profileData, error: profileErr } = await supabase.from('profiles').select('is_admin').eq('id', adminId).maybeSingle()

    if (profileErr || !profileData || profileData.is_admin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get request
    const { data: reqData, error: fetchErr } = await supabase.from('kyc_requests').select('*').eq('id', request_id).maybeSingle()
    if (fetchErr || !reqData) return NextResponse.json({ error: 'Request not found' }, { status: 404 })

    // Update request
    const updates: any = { status, reviewed_at: new Date().toISOString(), reviewed_by: adminId }
    if (reason) updates.review_reason = reason

    const { error: updateErr } = await supabase.from('kyc_requests').update(updates).eq('id', request_id)
    if (updateErr) return NextResponse.json({ error: 'Failed to update request' }, { status: 500 })

    // Update profile kyc status
    const profileUpdates: any = { kyc_status: status, kyc_reviewed_at: new Date().toISOString() }
    if (status === 'rejected') profileUpdates.kyc_rejection_reason = reason || null

    const { error: pErr } = await supabase.from('profiles').update(profileUpdates).eq('id', reqData.user_id)

    // Log admin action
    await supabase.from('admin_actions').insert([{ admin_id: adminId, action_type: 'kyc_review', target_user_id: reqData.user_id, target_table: 'kyc_requests', new_value: JSON.stringify({ request_id, status, reason }) }])

    if (pErr) return NextResponse.json({ error: 'Failed to update profile status' }, { status: 500 })

    return NextResponse.json({ ok: true })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 })
  }
}
