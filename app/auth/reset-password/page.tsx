'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { resetPassword } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await resetPassword(email)
      if (error) {
        setError(error.message)
      } else {
        setSent(true)
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
          <CardTitle className="text-2xl font-bold text-gray-900">Reset password</CardTitle>
          <CardDescription className="text-gray-600">
            Enter your email to receive a password reset link
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {!sent ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email address
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-green-800 hover:bg-green-900 text-white font-medium py-3 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send reset link'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="p-4 text-green-800 bg-green-50 border border-green-100 rounded-lg">
                <p className="font-medium">Check your email!</p>
                <p className="text-sm mt-1">
                  We&apos;ve sent a password reset link to <strong>{email}</strong>
                </p>
              </div>
              <p className="text-sm text-gray-600">
                Click the link in the email to reset your password.
                <br />
                If you don&apos;t see it, check your spam folder.
              </p>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Remember your password?{' '}</p>
            <Link href="/auth/signin" className="text-green-800 hover:text-green-900 hover:underline font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

