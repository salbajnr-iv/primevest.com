'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import type { User, Session, AuthError } from '@supabase/supabase-js'
import { createClient, setRealtimeAuth } from '@/lib/supabase/client'
import { frontendAuthService } from '@/lib/auth/client'

interface AdminAuthContextType {
  user: User | null
  session: Session | null
  isAdmin: boolean
  loading: boolean
  sessionError: string | null
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data?: { user: User | null; session: Session | null } }>
  signOut: () => Promise<void>
  refreshAdminStatus: () => Promise<boolean>
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)
const SESSION_EXPIRED_MESSAGE = 'Session expired. Please sign in again.'

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sessionError, setSessionError] = useState<string | null>(null)

  const pathname = usePathname()
  const router = useRouter()
  const supabase = useMemo(() => createClient(), [])

  const syncAdminState = useCallback(async (nextSession: Session | null, nextUser: User | null, nextIsAdmin: boolean) => {
    setSession(nextSession)
    setUser(nextUser)
    setIsAdmin(nextIsAdmin)
    await setRealtimeAuth(nextSession?.access_token, supabase)
  }, [supabase])

  const checkAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
    try {
      if (!supabase) return false

      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', userId)
        .single()

      if (error) {
        if (error.code !== 'PGRST116') {
          console.warn('Could not verify admin status:', error.message)
        }
        return false
      }

      return data?.is_admin === true
    } catch {
      console.warn('Error checking admin status')
      return false
    }
  }, [supabase])

  const redirectToAdminSignIn = useCallback(async (message = SESSION_EXPIRED_MESSAGE) => {
    setSessionError(message)
    await syncAdminState(null, null, false)

    if (pathname?.startsWith('/admin') && !pathname.startsWith('/admin/auth')) {
      router.push(`/admin/auth/signin?reason=session_expired&redirect=${encodeURIComponent(pathname)}`)
    }
  }, [pathname, router, syncAdminState])

  useEffect(() => {
    let active = true

    const hydrateAdminSession = async () => {
      if (!supabase) {
        setLoading(false)
        return
      }

      try {
        const result = await frontendAuthService.getSession()

        if (!active) return

        if (result.error) {
          await redirectToAdminSignIn(result.error.message)
          return
        }

        const nextSession = result.data.session
        const nextUser = result.data.user

        if (!nextSession || !nextUser) {
          await syncAdminState(null, null, false)
          setLoading(false)
          return
        }

        const adminStatus = await checkAdminStatus(nextUser.id)

        if (!adminStatus) {
          await syncAdminState(nextSession, nextUser, false)
          setLoading(false)
          return
        }

        setSessionError(null)
        await syncAdminState(nextSession, nextUser, true)
      } catch {
        if (active) {
          await redirectToAdminSignIn()
        }
      } finally {
        if (active) {
          setLoading(false)
        }
      }
    }

    void hydrateAdminSession()

    return () => {
      active = false
    }
  }, [checkAdminStatus, redirectToAdminSignIn, supabase, syncAdminState])

  const signIn = async (email: string, password: string) => {
    if (!supabase) {
      return { error: { message: 'Supabase is not configured' } as AuthError }
    }

    const result = await frontendAuthService.signIn({ email: email.trim().toLowerCase(), password })

    if (result.error || !result.data.user || !result.data.session) {
      return result
    }

    const adminStatus = await checkAdminStatus(result.data.user.id)
    setSessionError(null)
    await syncAdminState(result.data.session, result.data.user, adminStatus)

    return result
  }

  const signOut = async () => {
    try {
      if (supabase) {
        await setRealtimeAuth(undefined, supabase)
      }
      await frontendAuthService.signOut()
    } catch (error) {
      console.error('Unexpected admin sign out error:', error)
    } finally {
      setSessionError(null)
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

    const status = await checkAdminStatus(user.id)
    setIsAdmin(status)
    return status
  }

  return (
    <AdminAuthContext.Provider value={{ user, session, isAdmin, loading, sessionError, signIn, signOut, refreshAdminStatus }}>
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
