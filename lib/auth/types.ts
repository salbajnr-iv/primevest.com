import type { AuthError, Session, User } from '@supabase/supabase-js'

export type AuthenticatedSession = Session & {
  refresh_token: ''
}

export interface AuthSessionPayload {
  session: AuthenticatedSession | null
  user: User | null
}

export interface AuthApiSuccess<T> {
  data: T
  error: null
}

export interface AuthApiFailure {
  data?: undefined
  error: AuthError
}

export type AuthApiResult<T> = AuthApiSuccess<T> | AuthApiFailure
