import { NextResponse } from 'next/server'

import {
  AdminRouteError,
  getAdminClient,
  handleAdminRouteError,
  requestIpFromHeaders,
  requireAdminRequest,
} from '@/lib/admin/api'

interface SetUserActiveParams {
  p_user_id: string;
  p_is_active: boolean;
  p_admin_id: string;
  p_ip_address: string;
  p_context: Record<string, string>;
}

interface SetUserActiveResult {
  user_id: string;
  is_active: boolean;
  previous_is_active: boolean | null;
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { userId, isActive } = body

    if (!userId || typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Missing userId or isActive' }, { status: 400 })
    }

    const auth = await requireAdminRequest(req)
    if (auth.response) {
      return auth.response
    }

    const supabase = getAdminClient()
    const { data, error } = await supabase.rpc('set_user_active_status', {
      p_user_id: userId,
      p_is_active: isActive,
      p_admin_id: auth.adminId,
      p_ip_address: requestIpFromHeaders(req),
      p_context: {
        source: 'admin_api',
      },
    } as SetUserActiveParams)

    if (error) {
      if (error.message.toLowerCase().includes('not found')) {
        throw new AdminRouteError('Profile not found', 404, error.message)
      }

      throw new AdminRouteError('Failed to update user status', 500, error.message)
    }

    const result = Array.isArray(data) ? data[0] : data as SetUserActiveResult

    return NextResponse.json({
      ok: true,
      success: true,
      userId: result.user_id ?? userId,
      isActive: result.is_active ?? isActive,
      previousIsActive: result.previous_is_active ?? null,
    })
  } catch (err) {
    return handleAdminRouteError(err, 'Failed to update user status')
  }
}
