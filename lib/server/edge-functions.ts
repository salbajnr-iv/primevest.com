export async function invokeEdgeFunction(functionName: string, req: Request, payload: unknown, extraHeaders: Record<string, string> = {}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !anonKey) {
    return new Response(JSON.stringify({ error: 'Missing Supabase environment configuration' }), { status: 500 });
  }

  const authorization = req.headers.get('authorization') ?? `Bearer ${anonKey}`;
  const response = await fetch(`${supabaseUrl}/functions/v1/${functionName}`, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      authorization,
      ...extraHeaders,
    },
    body: JSON.stringify(payload),
  });

  const text = await response.text();
  return new Response(text, { status: response.status, headers: { 'content-type': 'application/json' } });
}
