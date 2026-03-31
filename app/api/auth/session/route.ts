import { createClient as createServerClient } from '@/lib/supabase/server'
import { authErrorResponse, authSuccessResponse } from '../_shared'
import { getCacheControlHeaders } from '@/lib/auth/session-manager'

export async function GET() {
  const supabase = await createServerClient()
  
  // Create response with proper cache control headers to prevent session caching
  let responseData
  let statusCode = 200

  // Use getUser() first - it validates with the identity provider
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    // User is not authenticated, try to clear any stale session
    try {
      await supabase.auth.signOut()
    } catch (e) {
      // Ignore signout errors
    }
    responseData = authSuccessResponse(null, null)
  } else {
    // Get the session for token info
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession()

    if (sessionError) {
      responseData = authErrorResponse(401, 'Your session has expired. Please sign in again.', 'SessionExpired')
      statusCode = 401
    } else {
      responseData = authSuccessResponse(session, user)
    }
  }

  // Create the response and add cache control headers
  const response = new Response(JSON.stringify(responseData), {
    status: statusCode,
    headers: {
      'Content-Type': 'application/json',
      ...getCacheControlHeaders(),
    },
  })

  return response
}
