import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { User } from '@supabase/supabase-js'

export async function updateSession(request: NextRequest) {
  const pathname = request.nextUrl.pathname

  const isAdminRoute = pathname.startsWith('/admin') && !pathname.startsWith('/admin/auth')

  const adminAuthRoutes = ['/admin/auth/signin', '/admin/signin']
  const isAdminAuthRoute = adminAuthRoutes.some((route) => pathname.startsWith(route))

  const protectedRoutes = ['/dashboard', '/settings', '/profile', '/account']
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

  const authRoutes = ['/auth/signin', '/auth/signup', '/auth/reset-password', '/auth/new-password', '/auth/otp-verify', '/auth/callback']
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route))

  const redirectToAdminSignIn = () => {
    const redirectUrl = new URL('/admin/auth/signin', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  const redirectToUserSignIn = () => {
    const redirectUrl = new URL('/auth/signin', request.url)
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Keep public pages accessible, but fail closed for protected routes.
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    if (isAdminRoute) return redirectToAdminSignIn()
    if (isProtectedRoute) return redirectToUserSignIn()
    return response
  }

  const supabase = createServerClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY,
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

  let user: User | null = null
  try {
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    if (isAdminRoute) return redirectToAdminSignIn()
    if (isProtectedRoute) return redirectToUserSignIn()
    return response
  }

  if (isAdminRoute && !user) {
    return redirectToAdminSignIn()
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

  if (isProtectedRoute && !user) {
    return redirectToUserSignIn()
  }

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
    '/((?!_next/static|_next/image|favicon.ico|public|api).*)',
  ],
}
