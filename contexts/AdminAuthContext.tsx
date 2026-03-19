'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User, Session, AuthError, AuthChangeEvent } from '@supabase/supabase-js'
import { verifyAdminAccess } from '@/lib/admin/check'
import { createClient, setRealtimeAuth } from '@/lib/supabase/client'

interface AdminAuthContextType {
  user: User | null
  session: Session | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data?: { user: User | null; session: Session | null } }>
  signOut: () => Promise<void>
  refreshAdminStatus: () => Promise<boolean>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  const checkAdminStatus = useCallback(async (): Promise<boolean> => {
    const { isAdmin: hasAdminAccess, userId } = await verifyAdminAccess()

    setIsAdmin(hasAdminAccess)

    if (!hasAdminAccess && userId === null) {
      setUser(null)
      setSession(null)
    }

    return hasAdminAccess
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    // Get initial session
    supabase.auth.getSession().then(async ({ data: { session } }: { data: { session: Session | null } }) => {
      await setRealtimeAuth(session?.access_token, supabase)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await checkAdminStatus()
      }
      
      setLoading(false)
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
      await setRealtimeAuth(session?.access_token, supabase)
      setSession(session)
      setUser(session?.user ?? null)
      
      if (session?.user) {
        await checkAdminStatus()
      } else {
        setIsAdmin(false)
      }
      
      setLoading(false)
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, checkAdminStatus])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase is not configured' } as AuthError }
    }

    const result = await supabase.auth.signInWithPassword({ email, password })
    
    // Check admin status after sign in
    if (result.data.user) {
      await checkAdminStatus()
    }
    
    return result
  }

  const signOut = async () => {
    try {
      if (!supabase) return

      await setRealtimeAuth(undefined, supabase)
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Admin sign out error:', error)
      }
    } catch (error) {
      console.error('Unexpected admin sign out error:', error)
    } finally {
      // Clear local state regardless of API call result
      setUser(null)
      setSession(null)
      setIsAdmin(false)
    }
  }

  const refreshAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false)
      return false
    }
    
    return checkAdminStatus()
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        signIn,
        signOut,
        refreshAdminStatus,
      }}
    >
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within an AdminAuthProvider')
  }
  return context
}

