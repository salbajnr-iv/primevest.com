import type { AuthError, UserMetadata } from '@supabase/supabase-js'
import type { AuthApiResult, AuthSessionPayload } from '@/lib/auth/types'

interface SignInPayload {
  email: string
  password: string
}

interface SignUpPayload extends SignInPayload {
  metadata?: UserMetadata
}

interface RequestOptions extends RequestInit {
  defaultErrorMessage: string
}

async function request<T>(input: string, init: RequestOptions): Promise<AuthApiResult<T>> {
  try {
    const response = await fetch(input, {
      ...init,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...(init.headers ?? {}),
      },
    })

    const payload = (await response.json().catch(() => null)) as AuthApiResult<T> | null

    if (!response.ok) {
      return {
        error: payload?.error ?? ({ message: init.defaultErrorMessage, name: 'AuthApiError', status: response.status } as AuthError),
      }
    }

    if (!payload?.data) {
      return {
        error: { message: init.defaultErrorMessage, name: 'AuthApiError', status: response.status } as AuthError,
      }
    }

    return {
      data: payload.data,
      error: null,
    }
  } catch {
    return {
      error: { message: init.defaultErrorMessage, name: 'NetworkError', status: 0 } as AuthError,
    }
  }
}

export const frontendAuthService = {
  getSession() {
    return request<AuthSessionPayload>('/api/auth/session', {
      method: 'GET',
      defaultErrorMessage: 'Unable to load your session.',
    })
  },
  signIn(payload: SignInPayload) {
    return request<AuthSessionPayload>('/api/auth/signin', {
      method: 'POST',
      body: JSON.stringify(payload),
      defaultErrorMessage: 'Authentication service unavailable.',
    })
  },
  signUp(payload: SignUpPayload) {
    return request<AuthSessionPayload>('/api/auth/signup', {
      method: 'POST',
      body: JSON.stringify(payload),
      defaultErrorMessage: 'Unable to create your account.',
    })
  },
  signOut() {
    return request<{ success: true }>('/api/auth/signout', {
      method: 'POST',
      defaultErrorMessage: 'Unable to sign out.',
    })
  },
}
