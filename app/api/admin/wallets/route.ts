import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminBearerToken } from '@/lib/admin/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const userId = url.searchParams.get('userId')

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

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

    // Fetch wallets for the user
    const { data: wallets, error } = await supabase
      .from('wallets')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      console.error('Error fetching wallets:', error)
      return NextResponse.json({ error: 'Failed to fetch wallets' }, { status: 500 })
    }

    // Also fetch a "system" wallet if one exists for the admin adjustment source
    // In many systems, there's a master/system wallet (user_id = '0000...')
    // For now, we'll return the user's wallets and assume the client knows the system wallet ID 
    // or handles the "from" ID appropriately.

    return NextResponse.json({ ok: true, wallets })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
