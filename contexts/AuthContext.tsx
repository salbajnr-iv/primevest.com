'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { AuthChangeEvent, AuthError, Session, User, UserMetadata } from '@supabase/supabase-js'
import { SupabaseErrorHandler } from '@/lib/supabase/error-handler'
import { createClient, setRealtimeAuth } from '@/lib/supabase/client'
import { getAuthSession, signInWithBackend, signOutWithBackend, signUpWithBackend } from '@/lib/auth/service'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  authMessage: string | null
  sessionError: string | null
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data?: { user: User | null; session: Session | null } }>
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<{ error: AuthError | null; data?: { user: User | null; session: Session | null } }>
  signInWithOAuth: (provider: 'google' | 'apple' | 'github') => Promise<{ error: AuthError | null; data?: { url: string | null } }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>
  verifyOtp: (email: string, token: string) => Promise<{ error: AuthError | null }>
  refreshSession: () => Promise<Session | null>
}

const SESSION_FLAG_KEY = 'primevest:had-session'
const SESSION_MESSAGE_KEY = 'primevest:auth-message'
const SESSION_EXPIRED_MESSAGE = 'Session expired. Please sign in again.'
const PROTECTED_PATHS = ['/dashboard', '/profile', '/wallets', '/support', '/settings', '/account']

const AuthContext = createContext<AuthContextType | undefined>(undefined)

function isProtectedPath(pathname: string | null) {
  if (!pathname) return false
  return PROTECTED_PATHS.some((segment) => pathname === segment || pathname.startsWith(`${segment}/`))
}

function getAuthRedirectPath(pathname: string | null) {
  if (!pathname || !pathname.startsWith('/')) {
    return '/dashboard'
  }

  return pathname
}

function toAuthError(message: string, status = 500, name = 'AuthApiError') {
  return { message, status, name } as AuthError
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])
  const redirectingRef = useRef(false)

  const clearSessionState = useCallback(async () => {
    setSession(null)
    setUser(null)

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(SESSION_FLAG_KEY)
    }

    await setRealtimeAuth(undefined, supabase)
  }, [supabase])

  const applySessionState = useCallback(async (nextSession: Session | null, nextUser: User | null) => {
    setSession(nextSession)
    setUser(nextUser)
    setAuthMessage(null)
    setSessionError(null)

    if (typeof window !== 'undefined') {
      if (nextSession?.access_token) {
        window.sessionStorage.setItem(SESSION_FLAG_KEY, '1')
      } else {
        window.sessionStorage.removeItem(SESSION_FLAG_KEY)
      }
    }

    await setRealtimeAuth(nextSession?.access_token, supabase)
  }, [supabase])

  const redirectToBackendSignIn = useCallback((message = SESSION_EXPIRED_MESSAGE) => {
    if (typeof window === 'undefined' || redirectingRef.current) {
      return
    }

    redirectingRef.current = true
    window.sessionStorage.setItem(SESSION_MESSAGE_KEY, message)
    const redirect = getAuthRedirectPath(window.location.pathname)
    window.location.assign(`/auth/signin?redirect=${encodeURIComponent(redirect)}`)
  }, [])

  const refreshSession = useCallback(async () => {
    const result = await getAuthSession()

    if (result.error) {
      await clearSessionState()
      setAuthMessage(SESSION_EXPIRED_MESSAGE)
      setSessionError(SESSION_EXPIRED_MESSAGE)

      const hadSession = typeof window !== 'undefined' && window.sessionStorage.getItem(SESSION_FLAG_KEY) === '1'
      if (hadSession && isProtectedPath(pathname)) {
        redirectToBackendSignIn(SESSION_EXPIRED_MESSAGE)
      }

      setLoading(false)
      return null
    }

    const hadSession = typeof window !== 'undefined' && window.sessionStorage.getItem(SESSION_FLAG_KEY) === '1'

    if (!result.session && hadSession && isProtectedPath(pathname)) {
      await clearSessionState()
      setAuthMessage(SESSION_EXPIRED_MESSAGE)
      setSessionError(SESSION_EXPIRED_MESSAGE)
      redirectToBackendSignIn(SESSION_EXPIRED_MESSAGE)
      setLoading(false)
      return null
    }

    await applySessionState(result.session, result.user)
    setLoading(false)
    return result.session
  }, [applySessionState, clearSessionState, pathname, redirectToBackendSignIn])

  useEffect(() => {
    let active = true

    void refreshSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event: AuthChangeEvent, nextSession: Session | null) => {
      if (!active) return

      if (event === 'SIGNED_OUT') {
        await clearSessionState()
        setLoading(false)
        return
      }

      if (nextSession?.access_token) {
        await applySessionState(nextSession, nextSession.user)
        setLoading(false)
        return
      }

      await refreshSession()
    })

    return () => {
      active = false
      subscription.unsubscribe()
    }
  }, [applySessionState, clearSessionState, refreshSession, supabase])

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()

    if (result.error || !result.session || !result.user) {
      return { error: result.error, data: undefined }
    }

      if (result.error || !result.data?.session || !result.data?.user) {
        return { error: result.error ?? toAuthError('Authentication failed.', 401), data: undefined }
      }

    if (result.error) {
      return { error: result.error, data: undefined }
    }
  }

  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    const normalizedEmail = email.trim().toLowerCase()
    const result = await frontendAuthService.signUp({ email: normalizedEmail, password, metadata })

    if (result.error) {
      return { error: result.error, data: undefined }
    }

    if (result.data.session && result.data.user) {
      await applySessionState(result.data.session, result.data.user)
    }

    return {
      error: null,
      data: {
        session: result.session,
        user: result.user,
      },
    }
  }

  const signInWithOAuth = async (provider: 'google' | 'apple' | 'github') => {
    const response = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    return {
      error: response.error,
      data: response.data ? { url: response.data.url } : undefined,
    }
  }

  const signOut = async () => {
    try {
      const backendResult = await frontendAuthService.signOut()
      if (backendResult.error) {
        console.error('Sign out error:', backendResult.error)
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error)
    } finally {
      await clearSessionState()
      setSessionError(null)
    }
  }

  const resetPassword = async (email: string) => {
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/new-password`,
    })
  }

  const updatePassword = async (newPassword: string) => {
    try {
      const result = await SupabaseErrorHandler.withRetry(async () => {
        return await supabase.auth.updateUser({ password: newPassword })
      })

      if (!result.error) {
        await refreshSession()
      }

      return result
    } catch (error) {
      return await SupabaseErrorHandler.handleSupabaseError(error, () => ({
        error: toAuthError('Authentication service unavailable', 0, 'NetworkError'),
      })) as { error: AuthError | null }
    }
  }

  const verifyOtp = async (email: string, token: string) => {
    const result = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (!result.error) {
      await refreshSession()
    }

    return result
  }

  // Fallback rule: direct password sign-in is only allowed if backend auth flow is intentionally unavailable
  // and the caller explicitly enables this non-sensitive fallback path.
  const _directSignInFallback = async (email: string, password: string, allowDirectSupabaseFallback = false) => {
    if (!allowDirectSupabaseFallback || !supabase) {
      return { error: toAuthError('Direct sign-in fallback is disabled.', 503, 'DirectAuthFallbackDisabled') }
    }

    return await supabase.auth.signInWithPassword({ email, password })
  }
  void _directSignInFallback

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        authMessage,
        sessionError,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        resetPassword,
        updatePassword,
        verifyOtp,
        refreshSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
