import type { AuthError, Session, User, UserMetadata } from '@supabase/supabase-js'

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

export interface AuthSignInRequest {
  email: string
  password: string
}

export interface AuthSignUpRequest extends AuthSignInRequest {
  metadata?: UserMetadata
}

export interface AuthSignOutResponse {
  success: true
}

export interface AuthContract {
  '/api/auth/signup': {
    method: 'POST'
    request: AuthSignUpRequest
    response: AuthSessionPayload
  }
  '/api/auth/signin': {
    method: 'POST'
    request: AuthSignInRequest
    response: AuthSessionPayload
  }
  '/api/auth/signout': {
    method: 'POST'
    request: undefined
    response: AuthSignOutResponse
  }
  '/api/auth/session': {
    method: 'GET'
    request: undefined
    response: AuthSessionPayload
  }
}

export type AuthEndpoint = keyof AuthContract

export type AuthEndpointMethod<TEndpoint extends AuthEndpoint> = AuthContract[TEndpoint]['method']
export type AuthEndpointRequest<TEndpoint extends AuthEndpoint> = AuthContract[TEndpoint]['request']
export type AuthEndpointResponse<TEndpoint extends AuthEndpoint> = AuthContract[TEndpoint]['response']
