import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminBearerToken } from '@/lib/admin/server'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, isActive } = body

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Missing userId or isActive' }, { status: 400 })
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

    // 1. Fetch current profile for audit
    const { data: currentProfile, error: fetchErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (fetchErr || !currentProfile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // 2. Update profile
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ is_active: isActive })
      .eq('id', userId)

    if (updateErr) throw updateErr

    // 3. Log admin action
    await supabase.from('admin_actions').insert([{
      admin_id: adminId,
      action_type: 'user_status_toggle',
      target_user_id: userId,
      old_value: { is_active: currentProfile.is_active },
      new_value: { is_active: isActive },
      ip_address: req.headers.get('x-forwarded-for') || null,
      created_at: new Date().toISOString()
    }])

    return NextResponse.json({ ok: true, success: true })
  } catch (err) {
    console.error('User status toggle error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
