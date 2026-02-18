'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

function OtpVerifyForm() {
  const [token, setToken] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { verifyOtp } = useAuth()
  const [type, setType] = useState('email')

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setType(params.get('type') || 'email')
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { error } = await verifyOtp(email, token)
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        // Redirect based on the type of verification
        setTimeout(() => {
          if (type === 'email') {
            router.push('/auth/signin')
          } else if (type === 'recovery') {
            router.push('/auth/new-password')
          } else {
            router.push('/')
          }
        }, 2000)
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    // In a real implementation, this would call a resend OTP API
    alert('Resend functionality would be implemented here. For password reset, please check your email for the reset link.')
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
      <Card className="w-full max-w-sm sm:max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Enter verification code</CardTitle>
          <CardDescription className="text-gray-600">
            {type === 'recovery' 
              ? 'Enter the code from your password reset email'
              : "We've sent a code to your email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {!success ? (
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

              <div className="space-y-2">
                <label htmlFor="token" className="text-sm font-medium text-gray-700">
                  Verification code
                </label>
                <input
                  id="token"
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent transition-all text-center text-2xl tracking-widest font-mono"
                  placeholder="000000"
                  maxLength={6}
                  required
                />
                <p className="text-xs text-gray-500 text-center">
                  Enter the 6-digit code from your email
                </p>
              </div>

              <Button
                type="submit"
                className="w-full bg-green-800 hover:bg-green-900 text-white font-medium py-3 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? 'Verifying...' : 'Verify code'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-green-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-green-800">Verification successful!</p>
                <p className="text-sm text-gray-600 mt-1">
                  {type === 'recovery' 
                    ? 'Your identity has been verified. Redirecting you to set a new password...'
                    : 'Your email has been verified. Redirecting...'}
                </p>
              </div>
            </div>
          )}

          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Didn&apos;t receive the code?{' '}</p>
            <button
              type="button"
              className="text-green-800 hover:text-green-900 hover:underline font-medium transition-colors"
              onClick={handleResend}
            >
              Resend code
            </button>
          </div>

          <div className="mt-4 text-center text-sm">
            <Link href="/auth/signin" className="text-gray-600 hover:text-gray-800 hover:underline transition-colors">
              Back to sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function OtpVerifyPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <Card className="w-full max-w-sm sm:max-w-md shadow-lg border-gray-200">
          <CardHeader className="space-y-1 text-center pb-6">
            <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-green-800 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <OtpVerifyForm />
    </Suspense>
  )
}

