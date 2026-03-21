import { NextResponse } from 'next/server'

import {
  AdminRouteError,
  getAdminClient,
  handleAdminRouteError,
  requestIpFromHeaders,
  requireAdminRequest,
} from '@/lib/admin/api'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { request_id, status, reason } = body || {}

    if (!request_id || !status || !['verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const auth = await requireAdminRequest(req)
    if (auth.response) {
      return auth.response
    }

    const supabase = getAdminClient()
    const { data, error } = await supabase.rpc('apply_kyc_review_decision', {
      p_request_id: request_id,
      p_decision: status,
      p_admin_id: auth.adminId,
      p_reason: reason || null,
      p_action_type: 'kyc_review',
      p_context: {
        source: 'admin_api',
      },
      p_ip_address: requestIpFromHeaders(req),
    } as any)

    if (error) {
      if (error.message.toLowerCase().includes('not found')) {
        throw new AdminRouteError('KYC request not found', 404, error.message)
      }

      throw new AdminRouteError('Failed to review KYC request', 500, error.message)
    }

    const result = Array.isArray(data) ? data[0] : data

    return NextResponse.json({
      ok: true,
      success: true,
      requestId: (result as any)?.request_id ?? request_id,
      status: (result as any)?.request_status ?? status,
      userId: (result as any)?.user_id ?? null,
    })
  } catch (err) {
    return handleAdminRouteError(err, 'Failed to review KYC request')
  }
}
