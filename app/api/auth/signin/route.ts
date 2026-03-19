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
}
