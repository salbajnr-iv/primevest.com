export async function checkSupabaseHealth(): Promise<boolean> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  if (!supabaseUrl) return false

  try {
    const response = await fetch(`${supabaseUrl}/rest/v1/`, {
      method: 'HEAD',
      headers: {
        'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
        'Content-Type': 'application/json'
      },
      signal: AbortSignal.timeout(5000)
    })
    
    return response.ok
  } catch (error) {
    console.warn('Supabase health check failed:', error)
    return false
  }
}

export function getSupabaseStatus(): 'healthy' | 'unhealthy' | 'unknown' {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!url || !key) return 'unknown'
  
  // Basic URL validation
  try {
    new URL(url)
    return 'healthy' // Assume healthy if URL is valid
  } catch {
    return 'unhealthy'
  }
}
