import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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
        { error: 'Forbidden: Only admins can delete users' },
        { status: 403 }
      )
    }

    // Cannot delete own account
    if (adminId === user_id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      )
    }

    // Get user info for audit log
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

    // Log the deletion action
    await supabase.from('admin_actions').insert([
      {
        admin_id: adminId,
        action_type: 'user_deleted',
        target_user_id: user_id,
        target_table: 'profiles',
        old_value: JSON.stringify({
          email: targetUser.email,
          full_name: targetUser.full_name,
          is_active: targetUser.is_active,
        }),
        new_value: JSON.stringify({ deleted: true }),
      },
    ])

    // Delete the user from auth (this will cascade delete profile)
    const { error: deleteAuthErr } = await supabase.auth.admin.deleteUser(user_id)

    if (deleteAuthErr) {
      return NextResponse.json(
        { error: 'Failed to delete user', details: String(deleteAuthErr) },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      message: `User ${targetUser.email} has been deleted`,
    })
  } catch (err) {
    return NextResponse.json(
      { error: 'Unexpected error', details: String(err) },
      { status: 500 }
    )
  }
}
