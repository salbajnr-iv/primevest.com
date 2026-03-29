import { Pool } from 'pg'

const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL

if (!SUPABASE_DB_URL) {
  console.error('❌ Missing SUPABASE_DB_URL. Export it before running this smoke test.')
  process.exit(1)
}

async function main() {
  const pool = new Pool({
    connectionString: SUPABASE_DB_URL,
    max: 1,
    connectionTimeoutMillis: 3000,
    idleTimeoutMillis: 3000,
  })

  try {
    await pool.query('select 1 as ok')
    console.log('✅ DB smoke test passed (pg.Pool connected and query succeeded).')
  } catch (error) {
    console.error('❌ DB smoke test failed:', error)
    process.exitCode = 1
  } finally {
    await pool.end()
  }
}

void main()
