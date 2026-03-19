import type { AuthError, UserMetadata } from '@supabase/supabase-js'
import type { AuthApiResult, AuthSessionPayload } from '@/lib/auth/types'

export interface AuthActionResponse extends AuthSessionPayload {
  error: AuthError | null
  identities?: unknown[]
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

function toAuthError(message: string, status = 500, name = 'AuthApiError'): AuthError {
  return { message, status, name } as AuthError
}

async function parseAuthResponse(response: Response): Promise<AuthActionResponse> {
  let body: AuthApiResult<AuthSessionPayload & { identities?: unknown[] }> | null = null

  try {
    body = (await response.json()) as AuthApiResult<AuthSessionPayload & { identities?: unknown[] }>
  } catch {
    body = null
  }

  if (!response.ok) {
    return {
      session: null,
      user: null,
      error: body?.error ?? toAuthError('Authentication request failed', response.status, 'AuthApiError'),
    }
  }

  if (!body?.data) {
    return {
      session: null,
      user: null,
      error: toAuthError('Authentication response was invalid', response.status, 'AuthApiError'),
    }
  }

  return {
    session: body.data.session,
    user: body.data.user,
    identities: body.data.identities,
    error: null,
  }
}

export async function getAuthSession(signal?: AbortSignal): Promise<AuthActionResponse> {
  try {
    const response = await fetch('/api/auth/session', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      signal,
    })

    return await parseAuthResponse(response)
  } catch {
    return {
      session: null,
      user: null,
      error: toAuthError('Unable to reach the authentication service', 0, 'NetworkError'),
    }
  }
}

export async function signInWithBackend(email: string, password: string): Promise<AuthActionResponse> {
  try {
    const response = await fetch('/api/auth/signin', {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      credentials: 'include',
      body: JSON.stringify({ email, password }),
    })

    return await parseAuthResponse(response)
  } catch {
    return {
      session: null,
      user: null,
      error: toAuthError('Unable to reach the authentication service', 0, 'NetworkError'),
    }
  }
}

export async function signUpWithBackend(email: string, password: string, metadata?: UserMetadata): Promise<AuthActionResponse> {
  try {
    const response = await fetch('/api/auth/signup', {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      credentials: 'include',
      body: JSON.stringify({ email, password, metadata }),
    })

    return await parseAuthResponse(response)
  } catch {
    return {
      session: null,
      user: null,
      error: toAuthError('Unable to reach the authentication service', 0, 'NetworkError'),
    }
  }
}

export async function signOutWithBackend(): Promise<{ error: AuthError | null }> {
  try {
    const response = await fetch('/api/auth/signout', {
      method: 'POST',
      headers: DEFAULT_HEADERS,
      credentials: 'include',
    })

    if (response.ok) {
      return { error: null }
    }

    const body = (await response.json().catch(() => null)) as AuthApiResult<{ success: true }> | null
    return {
      error: body?.error ?? toAuthError('Unable to sign out', response.status, 'AuthApiError'),
    }
  } catch {
    return {
      error: toAuthError('Unable to reach the authentication service', 0, 'NetworkError'),
    }
  }
}
