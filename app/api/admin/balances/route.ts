import { NextResponse } from 'next/server'

import { AdminRouteError, getAdminClient, handleAdminRouteError, requireAdminRequest } from '@/lib/admin/api'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const action = url.searchParams.get('action') || 'all'

    const auth = await requireAdminRequest(req)
    if (auth.response) {
      return auth.response
    }

    const supabase = getAdminClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('balance_history')
      .select(`
        *,
        profiles:user_id (email, full_name)
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (action !== 'all') {
      query = query.eq('action_type', action)
    }

    const { data, error, count } = await query

    if (error) {
      throw new AdminRouteError('Failed to fetch balance history', 500, error.message)
    }

    return NextResponse.json({ ok: true, history: data, total: count })
  } catch (err) {
    return handleAdminRouteError(err, 'Failed to fetch balance history')
  }
}
