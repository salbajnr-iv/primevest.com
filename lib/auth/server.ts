import type { AuthError, Session } from '@supabase/supabase-js'
import type { AuthenticatedSession } from '@/lib/auth/types'

export function sanitizeSession(session: Session | null): AuthenticatedSession | null {
  if (!session) {
    return null
  }

  return {
    ...session,
    refresh_token: '',
  }
}

export function toAuthError(message: string, status = 400, name = 'AuthApiError'): AuthError {
  return {
    name,
    message,
    status,
  } as AuthError
}
