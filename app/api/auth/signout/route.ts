import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { toAuthError } from '@/lib/auth/server'

export async function POST(request: NextRequest) {
  const response = NextResponse.json({ data: { success: true }, error: null })

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
    return NextResponse.json({ error: toAuthError('Unable to sign out.', 500, 'NetworkError') }, { status: 500 })
  }
}
