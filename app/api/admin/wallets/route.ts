import { NextResponse } from 'next/server'

import { AdminRouteError, getAdminClient, handleAdminRouteError, requireAdminRequest } from '@/lib/admin/api'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const auth = await requireAdminRequest(req)
    if (auth.response) {
      return auth.response
    }

    const supabase = getAdminClient()
    const { data: wallets, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      throw new AdminRouteError('Failed to fetch wallets', 500, error.message)
    }

    return NextResponse.json({ ok: true, wallets })
  } catch (err) {
    return handleAdminRouteError(err, 'Failed to fetch wallets')
  }
}
