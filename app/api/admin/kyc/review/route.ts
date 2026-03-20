import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminBearerToken } from '@/lib/admin/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { request_id, status, reason } = body || {}

    if (!request_id || !status || !['verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    const verification = await verifyAdminBearerToken(token)
    
    if (verification.error) {
      return NextResponse.json({ error: verification.error }, { status: verification.status || 401 })
    }

    const adminId = verification.adminId!
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Fetch current request data for audit
    const { data: currentReq, error: fetchErr } = await supabase
      .from('kyc_requests')
      .select('*')
      .eq('id', request_id)
      .single()

    if (fetchErr || !currentReq) {
      return NextResponse.json({ error: 'KYC request not found' }, { status: 404 })
    }

    const userId = currentReq.user_id
    const now = new Date().toISOString()

    // 2. Perform updates in a "transactional" way (sequential updates with service role)
    // Update KYC Request
    const { error: reqUpdateErr } = await supabase
      .from('kyc_requests')
      .update({
        status: status,
        reviewed_at: now,
        review_reason: reason || null
      })
      .eq('id', request_id)

    if (reqUpdateErr) throw reqUpdateErr

    // Update Profile Status
    const { error: profileUpdateErr } = await supabase
      .from('profiles')
      .update({ kyc_status: status })
      .eq('id', userId)

    if (profileUpdateErr) throw profileUpdateErr

    // 3. Log Admin Action for Audit
    const { error: auditErr } = await supabase
      .from('admin_actions')
      .insert([{
        admin_id: adminId,
        action_type: 'kyc_review',
        target_user_id: userId,
        old_value: currentReq,
        new_value: { status, review_reason: reason },
        ip_address: req.headers.get('x-forwarded-for') || null,
        created_at: now
      }])

    if (auditErr) {
      console.error('Audit logging failed:', auditErr)
      // We don't fail the whole request if only audit logging fails, 
      // but in production we might want stricter rules.
    }

    return NextResponse.json({ ok: true, success: true })
  } catch (err) {
    console.error('Admin KYC review error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
