import { createClient as createServerClient } from '@/lib/supabase/server'
import { authErrorResponse, authSuccessResponse } from '../_shared'

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    return authErrorResponse(401, 'Your session has expired. Please sign in again.', 'SessionExpired')
  }

  if (!session) {
    return authSuccessResponse(null, null)
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    await supabase.auth.signOut()
    return authErrorResponse(401, 'Your session has expired. Please sign in again.', 'SessionExpired')
  }

  return authSuccessResponse(session, user)
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
