import { NextResponse } from 'next/server'

import { invokeEdgeFunction } from '@/lib/server/edge-functions'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { request_id, status, reason } = body || {}

    if (!request_id || !status || !['verified', 'rejected'].includes(status)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const idempotencyKey = req.headers.get('x-idempotency-key') ?? crypto.randomUUID()

    return await invokeEdgeFunction('admin-kyc-decision', req, {
      requestId: request_id,
      decision: status,
      reason,
      idempotencyKey,
    }, {
      'x-idempotency-key': idempotencyKey,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 })
  }
}
