'use client'

import { Suspense, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { createBrowserClient } from '@supabase/ssr'

type OAuthProvider = 'google' | 'github' | 'facebook' | 'twitter' | 'apple' | 'discord'

function LoadingFallback() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading...</p>
      </div>
    </div>
  )
}

function OAuthConsentContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [consentData, setConsentData] = useState<{
    application_name: string
    scopes: string[]
    provider?: string
  }>({
    application_name: 'Bitpanda Pro App',
    scopes: ['openid', 'email', 'profile'],
    provider: undefined
  })

  // Get OAuth parameters from URL on client
  const providerRef = useRef<string | null>(null)
  const scopesRef = useRef<string | null>(null)
  const redirectToRef = useRef<string | null>(null)
  const codeChallengeRef = useRef<string | null>(null)
  const stateRef = useRef<string | null>(null)

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    providerRef.current = params.get('provider')
    scopesRef.current = params.get('scopes')
    redirectToRef.current = params.get('redirect_to')
    codeChallengeRef.current = params.get('code_challenge')
    stateRef.current = params.get('state')

    // Parse scopes from URL
    const scopesList = scopesRef.current?.split(',').map(s => s.trim()) || []
    
    // Defer state updates to avoid synchronous setState in effect
    const timer = setTimeout(() => {
      setConsentData({
        application_name: 'Bitpanda Pro App',
        scopes: scopesList.length > 0 ? scopesList : ['openid', 'email', 'profile'],
        provider: providerRef.current || undefined
      })
      setLoading(false)
    }, 0)

    return () => clearTimeout(timer)
  }, [])

  const handleConsent = async () => {
    try {
      setLoading(true)
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )

      const currentProvider = providerRef.current
      const currentScopes = scopesRef.current
      
      if (currentProvider) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: currentProvider as OAuthProvider,
          options: {
            redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
            scopes: currentScopes || 'openid email profile',
          }
        })

        if (error) {
          setError(error.message)
          setLoading(false)
        } else if (data.url) {
          window.location.href = data.url
        }
      } else {
        window.location.href = `/auth/signin?oauth_success=true`
      }
    } catch {
      setError('Failed to complete authorization')
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-lg border-gray-200">
        <CardHeader className="space-y-1 text-center pb-6">
          <div className="w-16 h-16 mx-auto mb-4">
            <svg viewBox="0 0 24 24" fill="none" className="w-full h-full">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="#15803d"/>
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="#15803d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">
            Authorize Access
          </CardTitle>
          <CardDescription className="text-gray-600">
            {consentData.application_name} wants to access your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-100 rounded-md mb-4">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <h3 className="font-medium text-gray-900 mb-3">
                This will allow {consentData.application_name} to:
              </h3>
              <ul className="space-y-2">
                {consentData.scopes.map((scope, index) => (
                  <li key={index} className="flex items-center text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-800 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {getScopeDescription(scope)}
                  </li>
                ))}
              </ul>
            </div>

            {consentData.provider && (
              <div className="text-center text-sm text-gray-600">
                <p>Signing in with <strong>{consentData.provider}</strong></p>
              </div>
            )}

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-gray-300 hover:bg-gray-50"
                onClick={() => window.history.back()}
              >
                Cancel
              </Button>
              <Button
                type="button"
                className="flex-1 bg-green-800 hover:bg-green-900 text-white"
                onClick={handleConsent}
                disabled={loading}
              >
                {loading ? 'Authorizing...' : 'Authorize'}
              </Button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <p>
              By authorizing, you agree to the{' '}
              <Link href="/terms" className="text-green-800 hover:underline">
                Terms and Conditions
              </Link>{' '}
              and{' '}
              <Link href="/privacy" className="text-green-800 hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Helper function to get human-readable scope descriptions
function getScopeDescription(scope: string): string {
  const scopeDescriptions: Record<string, string> = {
    'openid': 'OpenID Connect authentication',
    'email': 'Access your email address',
    'profile': 'Access your profile information',
    'name': 'Access your name',
    'picture': 'Access your profile picture',
    'auth_provider': 'Access your authentication provider',
    'custom_claims': 'Access custom claims',
  }
  
  return scopeDescriptions[scope] || scope
}

export default function OAuthConsentPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <OAuthConsentContent />
    </Suspense>
  )
}

