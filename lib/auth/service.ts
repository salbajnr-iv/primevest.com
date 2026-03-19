import type { AuthError, Session, User, UserMetadata } from '@supabase/supabase-js'

export interface AuthSessionPayload {
  session: Session | null
  user: User | null
}

export interface AuthActionResponse extends AuthSessionPayload {
  error: AuthError | null
  identities?: unknown[]
}

interface AuthServiceErrorBody {
  error?: {
    message?: string
    status?: number
    name?: string
    code?: string
  }
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
}

function toAuthError(message: string, status = 500, name = 'AuthApiError'): AuthError {
  return { message, status, name } as AuthError
}

async function parseAuthResponse(response: Response): Promise<AuthActionResponse> {
  let body: AuthActionResponse | AuthServiceErrorBody | null = null

  try {
    body = (await response.json()) as AuthActionResponse | AuthServiceErrorBody
  } catch {
    body = null
  }

  if (!response.ok) {
    const errorMessage = body && 'error' in body ? body.error?.message : undefined
    const errorStatus = body && 'error' in body ? body.error?.status : undefined
    const errorName = body && 'error' in body ? body.error?.name : undefined

    return {
      session: null,
      user: null,
      error: toAuthError(errorMessage ?? 'Authentication request failed', errorStatus ?? response.status, errorName ?? 'AuthApiError'),
    }
  }

  const result = body as AuthActionResponse | null

  return {
    session: result?.session ?? null,
    user: result?.user ?? null,
    identities: result?.identities,
    error: result?.error ?? null,
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

    const body = (await response.json().catch(() => null)) as AuthServiceErrorBody | null
    return {
      error: toAuthError(body?.error?.message ?? 'Unable to sign out', body?.error?.status ?? response.status, body?.error?.name ?? 'AuthApiError'),
    }
  } catch {
    return {
      error: toAuthError('Unable to reach the authentication service', 0, 'NetworkError'),
    }
  }
}
