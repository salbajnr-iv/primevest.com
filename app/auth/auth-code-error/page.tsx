'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import AuthLogo from '@/components/AuthLogo'

export default function AuthCodeErrorPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1 text-center pb-6">
          <AuthLogo />
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
              href="mailto:support@primevest.com"
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

