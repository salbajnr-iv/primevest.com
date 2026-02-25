'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import type { User, Session, UserMetadata, AuthError } from '@supabase/supabase-js'

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

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase])

  const signIn = async (email: string, password: string) => {
    if (!supabase) return { error: { name: 'AuthUnavailable', message: 'Supabase is not configured', status: 0 } as AuthError, data: undefined }
    return await supabase.auth.signInWithPassword({ email, password })
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

