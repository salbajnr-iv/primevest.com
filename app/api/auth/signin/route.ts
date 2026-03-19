import { createClient as createServerClient } from '@/lib/supabase/server'
import { authErrorResponse, authSuccessResponse } from '../_shared'

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as { email?: string; password?: string } | null
  const email = payload?.email?.trim().toLowerCase()
  const password = payload?.password

  if (!email || !password) {
    return authErrorResponse(400, 'Email and password are required.', 'InvalidCredentials')
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return authErrorResponse(error.status ?? 401, error.message, error.name)
  }

  if (!data.session || !data.user) {
    return authErrorResponse(401, 'Authentication failed. Please try again.', 'InvalidCredentials')
  }

  const { data: verifiedUserData, error: verifiedUserError } = await supabase.auth.getUser(data.session.access_token)

  if (verifiedUserError || !verifiedUserData.user || verifiedUserData.user.email?.toLowerCase() !== email) {
    await supabase.auth.signOut()
    return authErrorResponse(401, 'Authentication verification failed. Please try again.', 'AuthVerificationFailed')
  }

  return authSuccessResponse(data.session, verifiedUserData.user)
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { sanitizeSession, toAuthError } from '@/lib/auth/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ data: { session: null, user: null }, error: null })

  try {
    const { email, password } = await request.json() as { email?: string; password?: string }

    if (!email || !password) {
      return NextResponse.json({ error: toAuthError('Email and password are required.', 400, 'AuthValidationError') }, { status: 400 })
    }

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) => {
              response.cookies.set(name, value, options)
              request.cookies.set(name, value)
            })
          },
        },
      }
    )

    const { data, error } = await supabase.auth.signInWithPassword({
      email: email.trim().toLowerCase(),
      password,
    })

    if (error || !data.session || !data.user) {
      return NextResponse.json({ error: error ?? toAuthError('Authentication failed.', 401) }, { status: 401 })
    }

    const successResponse = NextResponse.json({
      data: {
        session: sanitizeSession(data.session),
        user: data.user,
      },
      error: null,
    })

    response.cookies.getAll().forEach((cookie) => {
      successResponse.cookies.set(cookie)
    })

    return successResponse
  } catch {
    return NextResponse.json({ error: toAuthError('Authentication service unavailable.', 500, 'NetworkError') }, { status: 500 })
  }
}
