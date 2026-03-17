'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import AuthLogo from '@/components/AuthLogo'
import { BRAND } from '@/lib/brand'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [acceptedTerms, setAcceptedTerms] = useState(false)
  const { signUp } = useAuth()
  
  const getPasswordStrength = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[A-Z]/.test(pwd)) strength++
    if (/[0-9]/.test(pwd)) strength++
    if (/[^A-Za-z0-9]/.test(pwd)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(password)
  const passwordStrengthLabels = ['Weak', 'Fair', 'Good', 'Strong']
  const passwordStrengthColors = ['bg-red-500', 'bg-orange-400', 'bg-yellow-500', 'bg-emerald-500']

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setMessage('')

    if (!acceptedTerms) {
      setError('You must accept the terms and conditions')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setLoading(true)

    try {
      const { error, data } = await signUp(email, password, {
        email,
      })

      if (error) {
        setError(error.message)
      } else if (data?.user && data.user.identities && data.user.identities.length === 0) {
        setError('This email may already be registered. Please check or try signing in.')
      } else {
        // Check if email confirmation is required
        setMessage('Check your email for a confirmation link. If you don&apos;t see it, check your spam folder.')
      }
    } catch {
      setError('An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
      {/* Back Button */}
      <Link href="/" className="absolute top-6 left-6 text-gray-400 hover:text-emerald-400 transition flex items-center gap-2">
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back</span>
      </Link>

      <Card className="w-full max-w-sm sm:max-w-md shadow-lg border-gray-200 bg-white">
        <CardHeader className="space-y-1 text-center pb-6">
          <AuthLogo />
          <CardTitle className="text-2xl font-bold text-gray-900">Create an account</CardTitle>
          <CardDescription className="text-gray-600">
            Join millions of users on {BRAND.productName}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          {!message ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-700 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-gray-700">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="name@example.com"
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
                  className="w-full p-3 border border-gray-300 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                  placeholder="••••••••"
                  required
                  minLength={8}
                />
                {password && (
                  <div className="space-y-1">
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map((level) => (
                        <div
                          key={level}
                          className={`h-1 flex-1 rounded transition-colors ${
                            passwordStrength >= level
                              ? passwordStrengthColors[passwordStrength - 1]
                              : 'bg-slate-600'
                          }`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400">
                      {passwordStrength > 0 ? passwordStrengthLabels[passwordStrength - 1] : ''}
                    </p>
                  </div>
                )}
                <p className="text-xs text-gray-400">
                  Must be at least 8 characters
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-sm font-medium text-gray-700">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className={`w-full p-3 border bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all ${
                    confirmPassword && password !== confirmPassword
                      ? 'border-red-500'
                      : 'border-gray-300'
                  }`}
                  placeholder="••••••••"
                  required
                />
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400">Passwords do not match</p>
                )}
              </div>

              <div className="flex items-start gap-2">
                <input
                  type="checkbox"
                  id="terms"
                  checked={acceptedTerms}
                  onChange={(e) => setAcceptedTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-600 bg-slate-700 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                  required
                />
                <label htmlFor="terms" className="text-sm text-gray-600">
                  I agree to the{' '}
                  <Link href="/terms" className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                    Terms and Conditions
                  </Link>{' '}
                  and{' '}
                  <Link href="/privacy" className="text-emerald-600 hover:text-emerald-700 hover:underline transition-colors">
                    Privacy Policy
                  </Link>
                </label>
              </div>

              <Button
                type="submit"
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 rounded-lg transition-colors"
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Create account'}
              </Button>
            </form>
          ) : (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-emerald-500/20 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <div>
                <p className="font-medium text-emerald-400">Account created!</p>
                <p className="text-sm text-gray-400 mt-1">
                  {message}
                </p>
              </div>
            </div>
          )}

          {/* Social Login */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">Or continue with</span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#10b981"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#10b981"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#10b981"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#10b981"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Google
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 bg-white hover:bg-gray-50 hover:border-gray-400 text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
                </svg>
                Apple
              </Button>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2 pt-4">
          <div className="text-center text-sm">
            <span className="text-gray-600">Already have an account? </span>
            <Link href="/auth/signin" className="text-emerald-600 hover:text-emerald-700 hover:underline font-medium transition-colors">
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

