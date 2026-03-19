'use client'

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
  sessionError: string | null
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data?: { user: User | null; session: Session | null } }>
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<{ error: AuthError | null; data?: { user: User | null; session: Session | null } }>
  signInWithOAuth: (provider: 'google' | 'apple' | 'github') => Promise<{ error: AuthError | null; data?: { url: string | null } }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>
  verifyOtp: (email: string, token: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)
const SESSION_EXPIRED_MESSAGE = 'Session expired. Please sign in again.'
const PROTECTED_PREFIXES = ['/dashboard', '/settings', '/profile', '/account']
const AUTH_PREFIXES = ['/auth/signin', '/auth/signup', '/auth/reset-password', '/auth/new-password', '/auth/otp-verify', '/auth/callback']

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
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
  }, [pathname, redirectToSignIn, syncSessionState])

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError, data: undefined }

    const normalizedEmail = email.trim().toLowerCase()

    try {
      const result = await SupabaseErrorHandler.withRetry(async () => frontendAuthService.signIn({ email: normalizedEmail, password }))

      if (result.error || !result.data.session || !result.data.user) {
        return result
      }

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
    return await supabase.auth.updateUser({ password: newPassword })
  }

  const verifyOtp = async (email: string, token: string) => {
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError }
    return await supabase.auth.verifyOtp({ email, token, type: 'email' })
  }

  return (
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
