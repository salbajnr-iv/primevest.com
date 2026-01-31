import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
<<<<<<< HEAD
import type { User } from '@supabase/supabase-js'
=======
>>>>>>> 02bdcb7 (Initial commit)

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

<<<<<<< HEAD
  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // If env vars are missing, skip Supabase auth to avoid request failures/404s
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    return response
  }

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
=======
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
>>>>>>> 02bdcb7 (Initial commit)
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

<<<<<<< HEAD
  let user: User | null = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    // If Supabase fails (network/env), bypass gating to avoid 404s
    return response
  }
=======
  const {
    data: { user },
  } = await supabase.auth.getUser()
>>>>>>> 02bdcb7 (Initial commit)

  // Admin-only routes
  const adminRoutes = ['/admin/dashboard', '/admin/users', '/admin/transactions', '/admin/balances', '/admin/audit', '/admin/settings']
  const isAdminRoute = adminRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Admin auth routes
<<<<<<< HEAD
  const adminAuthRoutes = ['/admin/auth/signin', '/admin/signin']
=======
  const adminAuthRoutes = ['/admin/auth/signin']
>>>>>>> 02bdcb7 (Initial commit)
  const isAdminAuthRoute = adminAuthRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Protected routes that require authentication (non-admin)
  const protectedRoutes = ['/dashboard', '/settings', '/profile', '/account']
  const isProtectedRoute = protectedRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Auth routes that should redirect if already logged in (non-admin)
  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/reset-password', '/auth/new-password', '/auth/otp-verify', '/auth/callback']
  const isAuthRoute = authRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Handle admin routes
  if (isAdminRoute && !user) {
    const redirectUrl = new URL('/admin/auth/signin', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAdminRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  if (isAdminAuthRoute && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profile?.is_admin) {
      return NextResponse.redirect(new URL('/admin/dashboard', request.url))
    }
  }

  // Redirect unauthenticated users from protected routes (non-admin)
  if (isProtectedRoute && !user) {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect authenticated users away from auth routes (non-admin)
  if (isAuthRoute && user) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export async function middleware(request: NextRequest) {
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
<<<<<<< HEAD
     * - api routes
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
=======
     * - api routes (optional)
     * - /admin routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api|admin).*)',
>>>>>>> 02bdcb7 (Initial commit)
  ],
}

