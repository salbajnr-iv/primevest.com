'use client'

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { usePathname } from 'next/navigation'
import type { AuthChangeEvent, AuthError, Session, User } from '@supabase/supabase-js'
import { createClient, setRealtimeAuth } from '@/lib/supabase/client'
import { getAuthSession, signInWithBackend, signOutWithBackend } from '@/lib/auth/service'

interface AdminAuthContextType {
  user: User | null
  session: Session | null
  isAdmin: boolean
  loading: boolean
  authMessage: string | null
  sessionError: string | null
  signIn: (email: string, password: string) => Promise<{ error: AuthError | null; data?: { user: User | null; session: Session | null } }>
  signOut: () => Promise<void>
  refreshAdminStatus: () => Promise<boolean>
  refreshSession: () => Promise<Session | null>
}

const SESSION_FLAG_KEY = 'primevest:admin-had-session'
const SESSION_MESSAGE_KEY = 'primevest:admin-auth-message'
const SESSION_EXPIRED_MESSAGE = 'Session expired. Please sign in again.'

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

function isProtectedAdminPath(pathname: string | null) {
  if (!pathname) return false
  return pathname === '/admin' || pathname.startsWith('/admin/')
}

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [loading, setLoading] = useState(true)
  const [authMessage, setAuthMessage] = useState<string | null>(null)
  const [sessionError, setSessionError] = useState<string | null>(null)
  const pathname = usePathname()
  const supabase = useMemo(() => createClient(), [])
  const redirectingRef = useRef(false)

  const checkAdminStatus = useCallback(async (userId: string): Promise<boolean> => {
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

    return Boolean(data?.is_admin)
  }, [supabase])

  const clearSessionState = useCallback(async () => {
    setSession(null)
    setUser(null)
    setIsAdmin(false)

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

    if (nextUser?.id) {
      setIsAdmin(await checkAdminStatus(nextUser.id))
      return
    }

    setIsAdmin(false)
  }, [checkAdminStatus, supabase])

  const redirectToAdminSignIn = useCallback((message = SESSION_EXPIRED_MESSAGE) => {
    if (typeof window === 'undefined' || redirectingRef.current) {
      return
    }

    redirectingRef.current = true
    window.sessionStorage.setItem(SESSION_MESSAGE_KEY, message)
    const redirect = window.location.pathname.startsWith('/admin/') ? window.location.pathname : '/admin/dashboard'
    window.location.assign(`/admin/auth/signin?redirect=${encodeURIComponent(redirect)}`)
  }, [])

  const refreshSession = useCallback(async () => {
    const result = await getAuthSession()

    if (result.error) {
      await clearSessionState()
      setAuthMessage(SESSION_EXPIRED_MESSAGE)
      setSessionError(SESSION_EXPIRED_MESSAGE)

      const hadSession = typeof window !== 'undefined' && window.sessionStorage.getItem(SESSION_FLAG_KEY) === '1'
      if (hadSession && isProtectedAdminPath(pathname)) {
        redirectToAdminSignIn(SESSION_EXPIRED_MESSAGE)
      }

      setLoading(false)
      return null
    }

    const hadSession = typeof window !== 'undefined' && window.sessionStorage.getItem(SESSION_FLAG_KEY) === '1'

    if (!result.session && hadSession && isProtectedAdminPath(pathname)) {
      await clearSessionState()
      setAuthMessage(SESSION_EXPIRED_MESSAGE)
      setSessionError(SESSION_EXPIRED_MESSAGE)
      redirectToAdminSignIn(SESSION_EXPIRED_MESSAGE)
      setLoading(false)
      return null
    }

    await applySessionState(result.session, result.user)
    setLoading(false)
    return result.session
  }, [applySessionState, clearSessionState, pathname, redirectToAdminSignIn])

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
    const result = await signInWithBackend(email.trim().toLowerCase(), password)

    if (result.error || !result.session || !result.user) {
      return { error: result.error, data: undefined }
    }

    await applySessionState(result.session, result.user)
    return {
      error: null,
      data: {
        session: result.session,
        user: result.user,
      },
    }
  }

  const signOut = async () => {
    try {
      const backendResult = await signOutWithBackend()
      if (backendResult.error) {
        console.error('Admin sign out error:', backendResult.error)
      }
    } catch (error) {
      console.error('Unexpected admin sign out error:', error)
    } finally {
      await clearSessionState()
      setSessionError(null)
    }
  }

  const refreshAdminStatus = async (): Promise<boolean> => {
    if (!user) {
      setIsAdmin(false)
      return false
    }

    const status = await checkAdminStatus(user.id)
    setIsAdmin(status)

    if (!status && isProtectedAdminPath(pathname)) {
      await signOut()
    }

    return status
  }

  return (
    <AdminAuthContext.Provider
      value={{
        user,
        session,
        isAdmin,
        loading,
        authMessage,
        sessionError,
        signIn,
        signOut,
        refreshAdminStatus,
        refreshSession,
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
