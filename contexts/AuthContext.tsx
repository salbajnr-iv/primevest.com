'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import type { User, Session, UserMetadata, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { SupabaseErrorHandler } from '@/lib/supabase/error-handler'
import { createClient, setRealtimeAuth } from '@/lib/supabase/client'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data?: { user: User | null; session: Session | null } }>
  signUp: (email: string, password: string, metadata?: UserMetadata) => Promise<{ error: AuthError | null; data?: { user: User | null; session: Session | null; identities?: unknown[] } }>
  signInWithOAuth: (provider: 'google' | 'apple' | 'github') => Promise<{ error: AuthError | null; data?: { url: string | null } }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ error: AuthError | null }>
  updatePassword: (newPassword: string) => Promise<{ error: AuthError | null }>
  verifyOtp: (email: string, token: string) => Promise<{ error: AuthError | null }>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    if (!supabase) {
      // Guest mode if Supabase env vars are missing
      setTimeout(() => setLoading(false), 0)
      return
    }

    // Get initial session with retry logic
    const getInitialSession = async () => {
      try {
        await SupabaseErrorHandler.withRetry(async () => {
          const { data: { session } } = await supabase.auth.getSession()
          setSession(session)
          setUser(session?.user ?? null)
          await setRealtimeAuth(session?.access_token, supabase)
          setLoading(false)
        })
      } catch {
        console.warn('Failed to get initial session, continuing in guest mode')
        setSession(null)
        setUser(null)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        try {
          setSession(session)
          setUser(session?.user ?? null)
          await setRealtimeAuth(session?.access_token, supabase)
          setLoading(false)
        } catch (error) {
          console.warn('Auth state change error:', error)
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError, data: undefined }

    const normalizedEmail = email.trim().toLowerCase()

    try {
      const result = await SupabaseErrorHandler.withRetry(async () => {
        return await supabase.auth.signInWithPassword({ email: normalizedEmail, password })
      })

      if (result.error || !result.data.session || !result.data.user) {
        return result
      }

      const { data: verifiedUserData, error: verifiedUserError } = await supabase.auth.getUser(result.data.session.access_token)

      if (
        verifiedUserError ||
        !verifiedUserData.user ||
        verifiedUserData.user.email?.toLowerCase() !== normalizedEmail
      ) {
        await supabase.auth.signOut()
        return {
          error: {
            name: 'AuthVerificationFailed',
            message: 'Authentication verification failed. Please check your credentials and try again.',
            status: 401,
          } as AuthError,
          data: undefined,
        }
      }

      return result
    } catch (error) {
      return await SupabaseErrorHandler.handleSupabaseError(error, () => ({
        error: { name: 'NetworkError', message: 'Authentication service unavailable', status: 0 } as AuthError,
        data: undefined
      })) as { error: AuthError | null; data?: { user: User | null; session: Session | null } }
    }
  }

  const signUp = async (
    email: string,
    password: string,
    metadata?: UserMetadata
  ) => {
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError, data: undefined }
    return await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
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
      data: response.data ? { url: response.data.url } : undefined
    }
  }

  const signOut = async () => {
    try {
      if (supabase) {
        await setRealtimeAuth(undefined, supabase)
        const { error } = await supabase.auth.signOut()
        if (error) {
          console.error('Sign out error:', error)
        }
      }
      // Clear local state regardless of API call result
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Unexpected sign out error:', error)
      // Still clear local state on error
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
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        signIn,
        signUp,
        signInWithOAuth,
        signOut,
        resetPassword,
        updatePassword,
        verifyOtp,
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

