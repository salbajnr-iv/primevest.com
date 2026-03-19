import { NextResponse } from 'next/server'
import type { AuthError, Session, User } from '@supabase/supabase-js'

export function authErrorResponse(status: number, message: string, name = 'AuthApiError') {
  return NextResponse.json(
    {
      session: null,
      user: null,
      error: { message, status, name } satisfies Partial<AuthError>,
    },
    { status }
  )
}

export function authSuccessResponse(session: Session | null, user: User | null, extra: Record<string, unknown> = {}) {
  return NextResponse.json({
    session,
    user,
    error: null,
    ...extra,
  })
}
