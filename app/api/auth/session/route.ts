import { createClient as createServerClient } from '@/lib/supabase/server'
import { authErrorResponse, authSuccessResponse } from '../_shared'

export async function GET() {
  const supabase = await createServerClient()
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession()

  if (sessionError) {
    return authErrorResponse(401, 'Your session has expired. Please sign in again.', 'SessionExpired')
  }

  if (!session) {
    return authSuccessResponse(null, null)
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    await supabase.auth.signOut()
    return authErrorResponse(401, 'Your session has expired. Please sign in again.', 'SessionExpired')
  }

  return authSuccessResponse(session, user)
}
