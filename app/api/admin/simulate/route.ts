import { NextResponse } from 'next/server'

import { invokeEdgeFunction } from '@/lib/server/edge-functions'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { target_user_id, operations } = body || {}

    if (!target_user_id || !operations || !Array.isArray(operations)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 })
    }

    const idempotencyKey = req.headers.get('x-idempotency-key') ?? crypto.randomUUID()

    return await invokeEdgeFunction('admin-maintenance-batch', req, {
      targetUserId: target_user_id,
      operations,
      idempotencyKey,
    }, {
      'x-idempotency-key': idempotencyKey,
    })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 })
  }
}
