'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Authentication Error</CardTitle>
          <CardDescription className="text-gray-600">
            There was a problem processing your authentication request
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg">
            <p className="font-medium">The authentication code is invalid or has expired.</p>
            <p className="mt-1">Please try signing in again or request a new confirmation link.</p>
          </div>

          <div className="space-y-3">
            <Link href="/auth/signin" className="block">
              <Button
                type="button"
                className="w-full bg-green-800 hover:bg-green-900 text-white font-medium py-3 rounded-lg transition-colors"
              >
                Sign In
              </Button>
            </Link>
            
            <Link href="/auth/signup" className="block">
              <Button
                type="button"
                variant="outline"
                className="w-full border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-colors"
              >
                Create New Account
              </Button>
            </Link>
          </div>

          <div className="text-center text-sm text-gray-600">
            <p>Need help?{' '}</p>
            <a
              href="mailto:support@bitpanda.com"
              className="text-green-800 hover:text-green-900 hover:underline font-medium transition-colors"
            >
              Contact Support
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

