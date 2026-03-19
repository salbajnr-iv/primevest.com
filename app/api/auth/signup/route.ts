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
}
