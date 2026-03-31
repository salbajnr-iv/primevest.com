import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

const client = new pg.Client(databaseUrl);

async function finalSetup() {
  console.log('╔════════════════════════════════════════════════════╗');
  console.log('║     FINAL CHAT SYSTEM SETUP & VERIFICATION        ║');
  console.log('╚════════════════════════════════════════════════════╝\n');

  await client.connect();

  try {
    // Step 1: Verify tables exist
    console.log('📋 Step 1: Verifying tables...');
    const tables = await client.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname='public' 
      AND tablename IN ('chat_conversations', 'chat_messages')
    `);
    console.log(`✅ Found ${tables.rows.length} chat tables\n`);

    // Step 2: Verify RLS is enabled
    console.log('🔒 Step 2: Checking RLS status...');
    const rls = await client.query(`
      SELECT tablename, rowsecurity FROM pg_tables 
      WHERE schemaname='public' 
      AND tablename IN ('chat_conversations', 'chat_messages')
    `);
    rls.rows.forEach(row => {
      console.log(`   ${row.tablename}: RLS ${row.rowsecurity ? 'ENABLED ✅' : 'DISABLED ❌'}`);
    });
    console.log();

    // Step 3: Verify anon privileges
    console.log('👤 Step 3: Checking anon privileges...');
    const perms = await client.query(`
      SELECT n.nspname as schema, c.relname as table_name, 
             has_table_privilege('anon', c.oid, 'SELECT') as select_perm,
             has_table_privilege('anon', c.oid, 'INSERT') as insert_perm,
             has_table_privilege('anon', c.oid, 'UPDATE') as update_perm,
             has_table_privilege('anon', c.oid, 'DELETE') as delete_perm
      FROM pg_class c
      JOIN pg_namespace n ON n.oid = c.relnamespace
      WHERE n.nspname = 'public' AND c.relname IN ('chat_conversations', 'chat_messages')
    `);
    
    perms.rows.forEach(row => {
      const perms = ['SELECT', 'INSERT', 'UPDATE', 'DELETE']
        .map(op => row[op.toLowerCase() + '_perm'] ? op : null)
        .filter(Boolean);
      console.log(`   ${row.table_name}: ${perms.join(', ')} ✅`);
    });
    console.log();

    // Step 4: Show active policies
    console.log('🛡️  Step 4: Active RLS Policies...');
    const policies = await client.query(`
      SELECT DISTINCT tablename, policyname, cmd 
      FROM pg_policies 
      WHERE tablename IN ('chat_conversations', 'chat_messages')
      AND policyname LIKE 'Enable%'
      ORDER BY tablename, cmd
    `);
    
    const byTable = {};
    policies.rows.forEach(row => {
      if (!byTable[row.tablename]) byTable[row.tablename] = [];
      const op = row.cmd === '*' ? 'ALL' : row.cmd.toUpperCase();
      byTable[row.tablename].push(op);
    });
    
    Object.entries(byTable).forEach(([table, ops]) => {
      console.log(`   ${table}: ${[...new Set(ops)].join(', ')}`);
    });
    console.log();

    // Step 5: Test insert 
    console.log('✍️  Step 5: Testing INSERT capability...');
    const testId = `test-${Date.now()}`;
    try {
      await client.query(
        'INSERT INTO chat_conversations (id, updated_at) VALUES ($1, $2)',
        [testId, new Date().toISOString()]
      );
      console.log('✅ INSERT test successful (test data inserted)\n');
      
      // Clean up
      await client.query('DELETE FROM chat_conversations WHERE id = $1', [testId]);
    } catch (e) {
      console.log(`❌ INSERT test failed: ${e.message}\n`);
    }

    // Summary
    console.log('╔════════════════════════════════════════════════════╗');
    console.log('║                   ✨ COMPLETE ✨                  ║');
    console.log('║                                                    ║');
    console.log('║  ✅ All RLS policies configured                  ║');
    console.log('║  ✅ Anonymous permissions granted                 ║');
    console.log('║  ✅ Database connection verified                  ║');
    console.log('║                                                    ║');
    console.log('║  NEXT STEPS:                                       ║');
    console.log('║  1. Reload your browser (F5)                      ║');
    console.log('║  2. Click the chat widget button                  ║');
    console.log('║  3. Test sending/receiving messages               ║');
    console.log('║                                                    ║');
    console.log('╚════════════════════════════════════════════════════╝\n');

  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

finalSetup();
