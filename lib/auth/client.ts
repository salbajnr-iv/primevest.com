import type { AuthError } from '@supabase/supabase-js'
import type {
  AuthApiResult,
  AuthEndpoint,
  AuthEndpointMethod,
  AuthEndpointRequest,
  AuthEndpointResponse,
} from '@/lib/auth/types'

interface RequestOptions {
  defaultErrorMessage: string
}

async function request<TEndpoint extends AuthEndpoint>(
  endpoint: TEndpoint,
  method: AuthEndpointMethod<TEndpoint>,
  payload: AuthEndpointRequest<TEndpoint>,
  options: RequestOptions,
): Promise<AuthApiResult<AuthEndpointResponse<TEndpoint>>> {
  try {
    const response = await fetch(endpoint, {
      method,
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
      },
      ...(payload === undefined ? {} : { body: JSON.stringify(payload) }),
    })

    const parsed = (await response.json().catch(() => null)) as AuthApiResult<AuthEndpointResponse<TEndpoint>> | null

    if (!response.ok) {
      return {
        error: parsed?.error ?? ({ message: options.defaultErrorMessage, name: 'AuthApiError', status: response.status } as AuthError),
      }
    }

    if (!parsed?.data) {
      return {
        error: { message: options.defaultErrorMessage, name: 'AuthApiError', status: response.status } as AuthError,
      }
    }

    return {
      data: parsed.data,
      error: null,
    }
  } catch {
    return {
      error: { message: options.defaultErrorMessage, name: 'NetworkError', status: 0 } as AuthError,
    }
  }
}

export const frontendAuthService = {
  getSession() {
    return request('/api/auth/session', 'GET', undefined, {
      defaultErrorMessage: 'Unable to load your session.',
    })
  },
  signIn(payload: AuthEndpointRequest<'/api/auth/signin'>) {
    return request('/api/auth/signin', 'POST', payload, {
      defaultErrorMessage: 'Authentication service unavailable.',
    })
  },
  signUp(payload: AuthEndpointRequest<'/api/auth/signup'>) {
    return request('/api/auth/signup', 'POST', payload, {
      defaultErrorMessage: 'Unable to create your account.',
    })
  },
  signOut() {
    return request('/api/auth/signout', 'POST', undefined, {
      defaultErrorMessage: 'Unable to sign out.',
    })
  },
}
