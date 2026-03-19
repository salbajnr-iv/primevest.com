import { createClient as createServerClient } from '@/lib/supabase/server'
import { authErrorResponse, authSuccessResponse } from '../_shared'

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    email?: string
    password?: string
    metadata?: Record<string, unknown>
  } | null

  const email = payload?.email?.trim().toLowerCase()
  const password = payload?.password

  if (!email || !password) {
    return authErrorResponse(400, 'Email and password are required.', 'InvalidCredentials')
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: payload?.metadata,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return authErrorResponse(error.status ?? 400, error.message, error.name)
  }

  return authSuccessResponse(data.session, data.user, {
    identities: data.user?.identities ?? [],
  })
import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { UserMetadata } from '@supabase/supabase-js'
import { sanitizeSession, toAuthError } from '@/lib/auth/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ data: { session: null, user: null }, error: null })

  try {
    const { email, password, metadata } = await request.json() as { email?: string; password?: string; metadata?: UserMetadata }

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

    const { data, error } = await supabase.auth.signUp({
      email: email.trim().toLowerCase(),
      password,
      options: {
        data: metadata,
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
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
    return NextResponse.json({ error: toAuthError('Unable to create your account.', 500, 'NetworkError') }, { status: 500 })
  }
}
