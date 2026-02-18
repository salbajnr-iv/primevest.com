import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// This endpoint handles impersonation by creating an audit log entry
// The actual impersonation session would be handled client-side or via a separate flow
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { user_id } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id is required' },
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

    // Verify admin user
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json(
        { error: 'Invalid auth token' },
        { status: 401 }
      )
    }

    const adminId = userData.user.id
    const { data: adminProfile, error: adminErr } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', adminId)
      .maybeSingle()

    if (adminErr || !adminProfile || adminProfile.is_admin !== true) {
      return NextResponse.json(
        { error: 'Forbidden: Only admins can impersonate users' },
        { status: 403 }
      )
    }

    // Cannot impersonate self
    if (adminId === user_id) {
      return NextResponse.json(
        { error: 'Cannot impersonate yourself' },
        { status: 400 }
      )
    }

    // Get target user info
    const { data: targetUser, error: targetErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user_id)
      .maybeSingle()

    if (targetErr || !targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Log the impersonation action
    await supabase.from('admin_actions').insert([
      {
        admin_id: adminId,
        action_type: 'user_impersonation',
        target_user_id: user_id,
        target_table: 'profiles',
        new_value: JSON.stringify({
          impersonated_user: targetUser.email,
          timestamp: new Date().toISOString(),
        }),
      },
    ])

    return NextResponse.json({
      ok: true,
      message: `Impersonation session initiated for ${targetUser.email}`,
      user: {
        id: targetUser.id,
        email: targetUser.email,
        full_name: targetUser.full_name,
      },
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Unexpected error', details: String(err) },
      { status: 500 }
    )
  }
}
