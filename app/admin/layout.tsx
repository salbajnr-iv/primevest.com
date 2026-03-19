'use client'

import { useEffect, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext'
import { ThemeProvider } from '@/components/ThemeProvider'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

export const dynamic = 'force-dynamic'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading, refreshAdminStatus } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isRouteChecking, setIsRouteChecking] = useState(false)

  const isAuthPage = pathname?.startsWith('/admin/auth/signin') || pathname?.startsWith('/admin/signin')

  useEffect(() => {
    if (loading || isAuthPage || !user) return

    let active = true

    const verifyRouteAccess = async () => {
      setIsRouteChecking(true)

      try {
        const hasAccess = await refreshAdminStatus()

        if (!active || hasAccess) {
          return
        }

        router.push('/dashboard')
      } finally {
        if (active) {
          setIsRouteChecking(false)
        }
      }
    }

    void verifyRouteAccess()

    return () => {
      active = false
    }
  }, [isAuthPage, loading, pathname, refreshAdminStatus, router, user])

  useEffect(() => {
    if (loading || isAuthPage) return

    if (!user) {
      router.push('/admin/auth/signin')
      return
    }

    if (!isRouteChecking && !isAdmin) {
      router.push('/dashboard')
    }
  }, [isAdmin, isAuthPage, isRouteChecking, loading, router, user])

  if (isAuthPage) return <div className="min-h-screen bg-white dark:bg-gray-900">{children}</div>

  if (loading || isRouteChecking || !user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdminSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen((prev) => !prev)} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <AdminHeader onMenuClick={() => setIsSidebarOpen((prev) => !prev)} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </ThemeProvider>
    </AdminAuthProvider>
  )
}
