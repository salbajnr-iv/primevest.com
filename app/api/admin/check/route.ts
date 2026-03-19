import { NextResponse } from 'next/server'

import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError || !user) {
      return NextResponse.json({ isAdmin: false, userId: null }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .maybeSingle()

    if (profileError || !profile) {
      return NextResponse.json({ isAdmin: false, userId: user.id }, { status: 403 })
    }

    return NextResponse.json({
      isAdmin: profile.is_admin === true,
      userId: user.id,
    })
  } catch (error) {
    return NextResponse.json(
      {
        isAdmin: false,
        userId: null,
        error: 'Unexpected error',
        details: String(error),
      },
      { status: 500 }
    )
  }
}
