import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateAdminSession(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Admin-only routes
  const adminRoutes = ['/admin/dashboard', '/admin/users', '/admin/transactions', '/admin/balances', '/admin/audit', '/admin/settings']
  const isAdminRoute = adminRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // Admin auth routes
  const adminAuthRoutes = ['/admin/auth/signin']
  const isAdminAuthRoute = adminAuthRoutes.some((route) =>
    request.nextUrl.pathname.startsWith(route)
  )

  // If accessing admin routes without authentication, redirect to admin sign in
  if (isAdminRoute && !user) {
    const redirectUrl = new URL('/admin/auth/signin', request.url)
    redirectUrl.searchParams.set('redirect', request.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is authenticated but not admin, redirect to main app sign in
  if (isAdminRoute && user) {
    // Check if user is admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL('/auth/signin', request.url))
    }
  }

  // If already logged in as admin, redirect to dashboard
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

  return response
}

export async function adminMiddleware(request: NextRequest) {
  return await updateAdminSession(request)
}

export const adminConfig = {
  matcher: [
    '/admin/:path*',
  ],
}

