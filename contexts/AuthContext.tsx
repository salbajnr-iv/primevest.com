'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User, Session, UserMetadata, AuthError } from '@supabase/supabase-js'
<<<<<<< HEAD
import { SupabaseErrorHandler } from '@/lib/supabase/error-handler'
=======
>>>>>>> 02bdcb7 (Initial commit)

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

<<<<<<< HEAD
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const supabase = SUPABASE_URL && SUPABASE_ANON_KEY
    ? createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    : null

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
          setLoading(false)
        })
      } catch (error) {
        console.warn('Failed to get initial session, continuing in guest mode')
        setSession(null)
        setUser(null)
        setLoading(false)
      }
    }

    getInitialSession()

    // Listen for auth changes with error handling
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        try {
          setSession(session)
          setUser(session?.user ?? null)
          setLoading(false)
        } catch (error) {
          console.warn('Auth state change error:', error)
        }
      }
    )
=======
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })
>>>>>>> 02bdcb7 (Initial commit)

    return () => {
      subscription.unsubscribe()
    }
<<<<<<< HEAD
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError, data: undefined }
    
    try {
      return await SupabaseErrorHandler.withRetry(async () => {
        return await supabase.auth.signInWithPassword({ email, password })
      })
    } catch (error) {
      return await SupabaseErrorHandler.handleSupabaseError(error, () => ({
        error: { name: 'NetworkError', message: 'Authentication service unavailable', status: 0 } as AuthError,
        data: undefined
      })) as { error: AuthError | null; data?: { user: User | null; session: Session | null } }
    }
=======
  }, [supabase.auth])

  const signIn = async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password })
>>>>>>> 02bdcb7 (Initial commit)
  }

  const signUp = async (
    email: string,
    password: string,
    metadata?: UserMetadata
  ) => {
<<<<<<< HEAD
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError, data: undefined }
=======
>>>>>>> 02bdcb7 (Initial commit)
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
<<<<<<< HEAD
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError }
=======
>>>>>>> 02bdcb7 (Initial commit)
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
<<<<<<< HEAD
    try {
      if (supabase) {
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
=======
    await supabase.auth.signOut()
    // Clear local state
    setUser(null)
    setSession(null)
  }

  const resetPassword = async (email: string) => {
>>>>>>> 02bdcb7 (Initial commit)
    return await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/new-password`,
    })
  }

  const updatePassword = async (newPassword: string) => {
<<<<<<< HEAD
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError }
=======
>>>>>>> 02bdcb7 (Initial commit)
    return await supabase.auth.updateUser({ password: newPassword })
  }

  const verifyOtp = async (email: string, token: string) => {
<<<<<<< HEAD
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError }
=======
>>>>>>> 02bdcb7 (Initial commit)
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

