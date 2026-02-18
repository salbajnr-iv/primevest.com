'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { AdminAuthProvider, useAdminAuth } from '@/contexts/AdminAuthContext'
import { ThemeProvider } from '@/components/ThemeProvider'
import AdminSidebar from '@/components/admin/AdminSidebar'
import AdminHeader from '@/components/admin/AdminHeader'

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)

  // Check if we're on an auth page (signin, etc.)
  const isAuthPage = pathname?.startsWith('/admin/auth/signin') || 
                     pathname?.startsWith('/admin/signin')

  useEffect(() => {
    // Only redirect if we're NOT on an auth page
    if (!loading && !isAuthPage) {
      if (!user) {
        router.push('/admin/auth/signin')
      } else if (user && !isAdmin) {
        // User is logged in but not admin - redirect to user dashboard
        router.push('/dashboard')
      }
    }
  }, [user, isAdmin, loading, router, isAuthPage])

  // If on auth page, show the page directly without blocking with loading spinner
  if (isAuthPage) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900">
        {children}
      </div>
    )
  }

  // Show loading state only for protected admin pages (not auth pages)
  if (loading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  // For non-auth pages, require authentication and admin status
  if (!user || !isAdmin) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 text-red-500">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <p className="text-gray-400">Checking permissions...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <AdminSidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      <div className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'}`}>
        <AdminHeader onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminAuthProvider>
      <ThemeProvider
        attribute="class"
        defaultTheme="dark"
        enableSystem
        disableTransitionOnChange
      >
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </ThemeProvider>
    </AdminAuthProvider>
  )
}

