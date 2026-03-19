'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { User, Session, UserMetadata, AuthError } from '@supabase/supabase-js'
import { SupabaseErrorHandler } from '@/lib/supabase/error-handler'
import { createClient, setRealtimeAuth } from '@/lib/supabase/client'
import { getAuthSession, signInWithBackend, signOutWithBackend, signUpWithBackend } from '@/lib/auth/service'
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { User, Session, UserMetadata, AuthError } from '@supabase/supabase-js'
import { SupabaseErrorHandler } from '@/lib/supabase/error-handler'
import { createClient, setRealtimeAuth } from '@/lib/supabase/client'
import { frontendAuthService } from '@/lib/auth/client'

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

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const SESSION_EXPIRED_MESSAGE = 'Session expired. Please sign in again.'
const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/profile', '/account']
const AUTH_PREFIXES = ['/auth/signin', '/auth/signup', '/auth/reset-password', '/auth/new-password', '/auth/otp-verify', '/auth/callback']

function isProtectedPath(pathname: string | null) {
  if (!pathname) return false

  return [
    '/dashboard',
    '/profile',
    '/wallets',
    '/support',
  ].some((segment) => pathname === segment || pathname.startsWith(`${segment}/`))
}

function getAuthRedirectPath(pathname: string | null) {
  if (!pathname || !pathname.startsWith('/')) {
    return '/dashboard'
  }

  return pathname
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const pathname = usePathname()
  const supabase = createClient()
  const redirectingRef = useRef(false)

  const clearSessionState = useCallback(async () => {
    setSession(null)
    setUser(null)

    if (typeof window !== 'undefined') {
      window.sessionStorage.removeItem(SESSION_FLAG_KEY)
    }

    if (supabase) {
      await setRealtimeAuth(undefined, supabase)
    }
  }, [supabase])

  const applySessionState = useCallback(async (nextSession: Session | null, nextUser: User | null) => {
    setSession(nextSession)
    setUser(nextUser)
    setAuthMessage(null)

    if (typeof window !== 'undefined') {
      if (nextSession?.access_token) {
        window.sessionStorage.setItem(SESSION_FLAG_KEY, '1')
      } else {
        window.sessionStorage.removeItem(SESSION_FLAG_KEY)
      }
    }

    if (supabase) {
      await setRealtimeAuth(nextSession?.access_token, supabase)
    }
  }, [supabase])

  const redirectToBackendSignIn = useMemo(() => {
    return (message = SESSION_EXPIRED_MESSAGE) => {
      if (typeof window === 'undefined' || redirectingRef.current) {
        return
      }

      redirectingRef.current = true
      window.sessionStorage.setItem(SESSION_MESSAGE_KEY, message)
      const redirect = getAuthRedirectPath(window.location.pathname)
      window.location.assign(`/auth/signin?redirect=${encodeURIComponent(redirect)}`)
    }
  }, [])

  const refreshSession = useMemo(() => {
    return async () => {
      const result = await getAuthSession()

      if (result.error) {
        await clearSessionState()
        setAuthMessage(SESSION_EXPIRED_MESSAGE)

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
        redirectToBackendSignIn(SESSION_EXPIRED_MESSAGE)
        setLoading(false)
        return null
      }

      await applySessionState(result.session, result.user)
      setLoading(false)
      return result.session
    }
  }, [applySessionState, clearSessionState, pathname, redirectToBackendSignIn])

  useEffect(() => {
    if (!supabase) {
      setTimeout(() => setLoading(false), 0)
      return
    }

    void refreshSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, nextSession) => {
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
  const [sessionError, setSessionError] = useState<string | null>(null)

  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const syncSessionState = useCallback(async (nextSession: Session | null, nextUser: User | null) => {
    setSession(nextSession)
    setUser(nextUser)
    await setRealtimeAuth(nextSession?.access_token, supabase)
  }, [supabase])

  const redirectToSignIn = useCallback(async (message = SESSION_EXPIRED_MESSAGE) => {
    setSessionError(message)
    await syncSessionState(null, null)

    if (AUTH_PREFIXES.some((prefix) => pathname?.startsWith(prefix))) {
      return
    }

    if (pathname && PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
      const redirect = pathname === '/' ? '/dashboard' : pathname
      router.push(`/auth/signin?reason=session_expired&redirect=${encodeURIComponent(redirect)}`)
    }
  }, [pathname, router, syncSessionState])

  useEffect(() => {
    let active = true

    const hydrateSession = async () => {
      try {
        const result = await frontendAuthService.getSession()

        if (!active) return

        if (result.error) {
          await redirectToSignIn(result.error.message)
          return
        }

        const nextSession = result.data.session
        const nextUser = result.data.user

        if (!nextSession || !nextUser) {
          await syncSessionState(null, null)
          setLoading(false)
          return
        }

        setSessionError(null)
        await syncSessionState(nextSession, nextUser)
      } catch {
        if (active) {
          await redirectToSignIn()
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void hydrateSession()

    return () => {
      active = false
    }
  }, [applySessionState, clearSessionState, refreshSession, supabase])
  }, [pathname, redirectToSignIn, syncSessionState])

  const signIn = async (email: string, password: string) => {
    const normalizedEmail = email.trim().toLowerCase()
    const result = await signInWithBackend(normalizedEmail, password)

    if (result.error || !result.session || !result.user) {
      return { error: result.error, data: undefined }
    }
    try {
      const result = await SupabaseErrorHandler.withRetry(async () => frontendAuthService.signIn({ email: normalizedEmail, password }))

    await applySessionState(result.session, result.user)
    return {
      error: null,
      data: {
        session: result.session,
        user: result.user,
      },
    }
  }

  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    const normalizedEmail = email.trim().toLowerCase()
    const result = await signUpWithBackend(normalizedEmail, password, metadata)

    if (result.error) {
      return { error: result.error, data: undefined }
      if (result.data.user.email?.toLowerCase() !== normalizedEmail) {
        await signOut()
        return {
          error: {
            name: 'AuthVerificationFailed',
            message: 'Authentication verification failed. Please check your credentials and try again.',
            status: 401,
          } as AuthError,
          data: undefined,
        }
      }

      setSessionError(null)
      await syncSessionState(result.data.session, result.data.user)
      return result
    } catch (error) {
      return await SupabaseErrorHandler.handleSupabaseError(error, () => ({
        error: { name: 'NetworkError', message: 'Authentication service unavailable', status: 0 } as AuthError,
        data: undefined,
      })) as { error: AuthError | null; data?: { user: User | null; session: Session | null } }
    }

    if (result.session && result.user) {
      await applySessionState(result.session, result.user)
    }

    return {
      error: null,
      data: {
        session: result.session,
        user: result.user,
        identities: result.identities,
      },
    }
  const signUp = async (email: string, password: string, metadata?: UserMetadata) => {
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError, data: undefined }

    const normalizedEmail = email.trim().toLowerCase()
    const result = await frontendAuthService.signUp({ email: normalizedEmail, password, metadata })

    if (!result.error && result.data.session && result.data.user) {
      setSessionError(null)
      await syncSessionState(result.data.session, result.data.user)
    }

    return result
  }

  const signInWithOAuth = async (provider: 'google' | 'apple' | 'github') => {
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError }
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
      const backendResult = await signOutWithBackend()
      if (backendResult.error) {
        console.error('Sign out error:', backendResult.error)
      }
    } catch (error) {
      console.error('Unexpected sign out error:', error)
    } finally {
      await clearSessionState()
      if (supabase) {
        await setRealtimeAuth(undefined, supabase)
      }
      await frontendAuthService.signOut()
    } catch (error) {
      console.error('Unexpected sign out error:', error)
    } finally {
      setSessionError(null)
      setUser(null)
      setSession(null)
    }
  }

  const resetPassword = async (email: string) => {
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError }
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/new-password`,
    })
  }

  const updatePassword = async (newPassword: string) => {
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError }

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
        error: { name: 'NetworkError', message: 'Authentication service unavailable', status: 0 } as AuthError,
      })) as { error: AuthError | null }
    }
  }

  const verifyOtp = async (email: string, token: string) => {
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError }

    const result = await supabase.auth.verifyOtp({ email, token, type: 'email' })
    if (!result.error) {
      await refreshSession()
    }

    return result
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        authMessage,
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
    <AuthContext.Provider value={{ user, session, loading, sessionError, signIn, signUp, signInWithOAuth, signOut, resetPassword, updatePassword, verifyOtp }}>
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
