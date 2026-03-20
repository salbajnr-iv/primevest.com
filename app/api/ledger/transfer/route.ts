import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { verifyAdminBearerToken } from '@/lib/admin/server'

const TransferSchema = z.object({
  from_wallet_id: z.string().uuid(),
  to_wallet_id: z.string().uuid(),
  asset: z.string().min(1),
  network: z.string().min(1),
  amount: z.string().regex(/^\d+(\.\d+)?$/, "Must be a numeric string"),
  idempotency_key: z.string().min(1),
  metadata: z.record(z.string(), z.unknown()).optional()
})

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const validation = TransferSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: 'Validation failed', details: validation.error.format() }, { status: 400 })
    }

    const { from_wallet_id, to_wallet_id, asset, network, amount, idempotency_key, metadata = {} } = validation.data

    // Since this is a critical ledger operation, we verify admin or system status
    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    const verification = await verifyAdminBearerToken(token)
    
    if (verification.error) {
      return NextResponse.json({ error: verification.error }, { status: verification.status || 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Note: Supabase JS doesn't support explicit Postgres transactions (BEGIN/COMMIT).
    // The "Backendguide.md" recommends using RPC for multi-statement atomic operations 
    // or a direct Postgres client (pg pool).
    // For this implementation, we'll use a Supabase RPC if available, or sequential updates 
    // with idempotency checks.

    // 1. Check idempotency
    const { data: existingIdem, error: idemErr } = await supabase
      .from('ledger_idempotency')
      .select('*')
      .eq('idempotency_key', idempotency_key)
      .maybeSingle()

    if (idemErr) throw idemErr
    if (existingIdem) {
      return NextResponse.json({ already_executed: true, result: existingIdem.result })
    }

    // 2. Fetch and Lock balances (Conceptual, as select().eq().single() doesn't LOCK in REST)
    // Real implementation should use a database function (RPC) to ensure atomicity.
    
    // Attempt to invoke a database function 'process_ledger_transfer'
    const { data: rpcData, error: rpcErr } = await supabase.rpc('process_ledger_transfer', {
      p_from_wallet_id: from_wallet_id,
      p_to_wallet_id: to_wallet_id,
      p_asset: asset,
      p_network: network,
      p_amount: amount,
      p_idempotency_key: idempotency_key,
      p_metadata: metadata
    })

    if (rpcErr) {
      console.error('Ledger transfer RPC failed:', rpcErr)
      return NextResponse.json({ error: rpcErr.message || 'Transfer failed' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, result: rpcData })
  } catch (err) {
    console.error('Ledger transfer error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
