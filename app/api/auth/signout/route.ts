import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { toAuthError } from '@/lib/auth/server'
import { getCacheControlHeaders } from '@/lib/auth/session-manager'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ data: { success: true }, error: null })

  // Add cache control headers to prevent session caching
  Object.entries(getCacheControlHeaders()).forEach(([key, value]) => {
    response.headers.set(key, value)
  })

  try {
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

    const { error } = await supabase.auth.signOut()

    if (error) {
      return NextResponse.json({ error }, { status: 400 })
    }

    return response
  } catch {
    const errorResponse = NextResponse.json(
      { error: toAuthError('Unable to sign out.', 500, 'NetworkError') },
      { status: 500 }
    )

    // Add cache control headers to error response too
    Object.entries(getCacheControlHeaders()).forEach(([key, value]) => {
      errorResponse.headers.set(key, value)
    })

    return errorResponse
  }
}
