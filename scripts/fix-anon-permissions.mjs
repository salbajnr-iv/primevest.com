import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL in .env');
  process.exit(1);
}

const client = new pg.Client(databaseUrl);

async function fixAnonPermissions() {
  console.log('╔══════════════════════════════════════════════╗');
  console.log('║  Fixing Anonymous User Permissions          ║');
  console.log('╚══════════════════════════════════════════════╝\n');

  await client.connect();

  try {
    // Drop existing permissive policies and recreate them properly
    console.log('🔧 Fixing RLS policies for anonymous access...\n');

    // For chat_conversations
    console.log('1️⃣  Updating chat_conversations policies...');
    
    // Drop old policies
    await client.query(`
      DROP POLICY IF EXISTS "Enable all access for anon" ON chat_conversations;
    `).catch(() => {});

    // Create proper policies
    await client.query(`
      CREATE POLICY "Enable read for anon" ON chat_conversations
      AS PERMISSIVE FOR SELECT TO anon
      USING (true);
    `).catch((e) => console.log('   ℹ️  Read policy:', e.message.split('\n')[0]));

    await client.query(`
      CREATE POLICY "Enable insert for anon" ON chat_conversations
      AS PERMISSIVE FOR INSERT TO anon
      WITH CHECK (true);
    `).catch((e) => console.log('   ℹ️  Insert policy:', e.message.split('\n')[0]));

    await client.query(`
      CREATE POLICY "Enable update for anon" ON chat_conversations
      AS PERMISSIVE FOR UPDATE TO anon
      USING (true)
      WITH CHECK (true);
    `).catch((e) => console.log('   ℹ️  Update policy:', e.message.split('\n')[0]));

    await client.query(`
      CREATE POLICY "Enable delete for anon" ON chat_conversations
      AS PERMISSIVE FOR DELETE TO anon
      USING (true);
    `).catch((e) => console.log('   ℹ️  Delete policy:', e.message.split('\n')[0]));

    console.log('✅ chat_conversations policies updated\n');

    // For chat_messages
    console.log('2️⃣  Updating chat_messages policies...');

    await client.query(`
      DROP POLICY IF EXISTS "Enable all access for anon" ON chat_messages;
    `).catch(() => {});

    await client.query(`
      CREATE POLICY "Enable read for anon" ON chat_messages
      AS PERMISSIVE FOR SELECT TO anon
      USING (true);
    `).catch((e) => console.log('   ℹ️  Read policy:', e.message.split('\n')[0]));

    await client.query(`
      CREATE POLICY "Enable insert for anon" ON chat_messages
      AS PERMISSIVE FOR INSERT TO anon
      WITH CHECK (true);
    `).catch((e) => console.log('   ℹ️  Insert policy:', e.message.split('\n')[0]));

    await client.query(`
      CREATE POLICY "Enable update for anon" ON chat_messages
      AS PERMISSIVE FOR UPDATE TO anon
      USING (true)
      WITH CHECK (true);
    `).catch((e) => console.log('   ℹ️  Update policy:', e.message.split('\n')[0]));

    await client.query(`
      CREATE POLICY "Enable delete for anon" ON chat_messages
      AS PERMISSIVE FOR DELETE TO anon
      USING (true);
    `).catch((e) => console.log('   ℹ️  Delete policy:', e.message.split('\n')[0]));

    console.log('✅ chat_messages policies updated\n');

    // Verify policies
    console.log('3️⃣  Verifying policies...');
    const policies = await client.query(`
      SELECT schemaname, tablename, policyname, permissive, cmd, roles 
      FROM pg_policies
      WHERE tablename IN ('chat_conversations', 'chat_messages')
      AND policyname LIKE 'Enable%'
      ORDER BY tablename, cmd;
    `);

    console.log('\n✅ Active policies:');
    policies.rows.forEach(row => {
      const operation = row.cmd === '*' ? 'ALL' : row.cmd.toUpperCase();
      console.log(`   ${row.tablename}: ${operation} → roles: [${row.roles}]`);
    });

    console.log('\n✨ All permissions fixed!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

fixAnonPermissions();
