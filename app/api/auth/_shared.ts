import { NextResponse } from 'next/server'
import type { AuthError, Session, User } from '@supabase/supabase-js'
import { sanitizeSession } from '@/lib/auth/server'
import type { AuthApiResult, AuthSessionPayload } from '@/lib/auth/types'

export function authErrorResponse(status: number, message: string, name = 'AuthApiError') {
  // Clamp status to valid HTTP range
  const clampedStatus = Math.max(200, Math.min(599, status || 500))
  const payload: AuthApiResult<AuthSessionPayload> = {
    error: { message, status: clampedStatus, name } as AuthError,
  }

  return NextResponse.json(payload, { status: clampedStatus })
}

export function authSuccessResponse(session: Session | null, user: User | null, extra: Record<string, unknown> = {}) {
  const payload: AuthApiResult<AuthSessionPayload & Record<string, unknown>> = {
    data: {
      session: sanitizeSession(session),
      user,
      ...extra,
    },
    error: null,
  }

  return NextResponse.json(payload)
}
