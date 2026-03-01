'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

export default function AdminSignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signIn, isAdmin, loading: contextLoading } = useAdminAuth()

  // Redirect if already logged in as admin (useEffect for proper side effect handling)
  useEffect(() => {
    if (!contextLoading && isAdmin) {
      router.push('/admin/dashboard')
    }
  }, [isAdmin, contextLoading, router])

  // Show loading state while checking auth status
  if (contextLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full animate-pulse">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#15803d"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error: signInError, data } = await signIn(email, password)
      
      if (signInError) {
        setError(signInError.message)
      } else if (data?.user) {
        // Check if user is admin after sign in
        router.push('/admin/dashboard')
        router.refresh()
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-sm sm:max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#15803d"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Admin Portal</CardTitle>
          <CardDescription className="text-gray-600">
            Sign in to access the admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md mb-4">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Admin Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all"
                placeholder="admin@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all"
                placeholder="••••••••"
                required
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-green-800 hover:bg-green-900 text-white font-medium py-3 rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? 'Signing in...' : 'Sign in to Admin'}
            </Button>
          </form>

          {/* Security Notice */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex items-center gap-2 text-yellow-700 mb-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-sm font-medium">Restricted Access</span>
            </div>
            <p className="text-xs text-gray-600">
              This area is restricted to authorized administrators only. All actions are logged and monitored.
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4 border-t border-gray-200">
          <div className="text-center text-sm">
            <span className="text-gray-600">Back to </span>
            <Link href="/" className="text-green-800 hover:text-green-900 hover:underline font-medium transition-colors">
              Main Website
            </Link>
          </div>
          <div className="text-center text-sm">
            <span className="text-gray-600">User login: </span>
            <Link href="/auth/signin" className="text-blue-800 hover:text-blue-900 hover:underline font-medium transition-colors">
              Sign In
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

