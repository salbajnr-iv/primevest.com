import { invokeEdgeFunction } from '@/lib/server/edge-functions'

export async function POST(req: Request) {
  const body = await req.json()
  const signature = req.headers.get('x-kyc-signature') ?? ''

  return invokeEdgeFunction('kyc-provider-callback', req, body, {
    'x-kyc-signature': signature,
  })
}
