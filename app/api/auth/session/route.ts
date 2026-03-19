import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { sanitizeSession } from '@/lib/auth/server'

export async function GET() {
  try {
    const supabase = await createClient()
    const [{ data: sessionData }, { data: userData }] = await Promise.all([
      supabase.auth.getSession(),
      supabase.auth.getUser(),
    ])

    if (!sessionData.session || !userData.user) {
      return NextResponse.json({ data: { session: null, user: null }, error: null })
    }

    return NextResponse.json({
      data: {
        session: sanitizeSession(sessionData.session),
        user: userData.user,
      },
      error: null,
    })
  } catch {
    return NextResponse.json({ data: { session: null, user: null }, error: null }, { status: 200 })
  }
}
