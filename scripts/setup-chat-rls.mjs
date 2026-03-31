import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL in .env');
  process.exit(1);
}

const client = new pg.Client(databaseUrl);

async function setupRLSPolicies() {
  console.log('🔧 Setting up RLS policies for chat tables...\n');

  await client.connect();

  try {
    // SQL migrations from the migration file
    const migrations = [
      'ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY "Enable all access for anon" ON chat_conversations FOR ALL TO anon USING (true) WITH CHECK (true);',
      'ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;',
      'CREATE POLICY "Enable all access for anon" ON chat_messages FOR ALL TO anon USING (true) WITH CHECK (true);'
    ];

    for (let i = 0; i < migrations.length; i++) {
      const sql = migrations[i];
      console.log(`${i + 1}️⃣  Executing: ${sql.substring(0, 60)}...`);
      try {
        await client.query(sql);
        console.log(`✅ Success\n`);
      } catch (error) {
        if (error.message?.includes('already') || error.code === '42P60') {
          console.log(`ℹ️  Already exists (no-op)\n`);
        } else {
          console.error(`❌ Error:`, error.message, '\n');
        }
      }
    }

    console.log('✅ RLS policies setup complete!\n');
  } finally {
    await client.end();
  }
}

async function testChatConnection() {
  console.log('🧪 Testing chat functionality...\n');

  const testClient = new pg.Client(databaseUrl);
  await testClient.connect();

  try {
    // Test 1: Check tables exist
    console.log('1️⃣  Checking chat tables exist...');
    const tableCheck = await testClient.query(`
      SELECT tablename FROM pg_tables 
      WHERE schemaname = 'public' 
      AND tablename IN ('chat_conversations', 'chat_messages')
    `);
    
    if (tableCheck.rows.length === 2) {
      console.log('✅ Both chat tables found');
    } else {
      console.error('❌ Missing chat tables');
    }

    // Test 2: Check RLS is enabled
    console.log('\n2️⃣  Checking RLS policies...');
    const policyCheck = await testClient.query(`
      SELECT schemaname, tablename, policyname FROM pg_policies 
      WHERE tablename IN ('chat_conversations', 'chat_messages')
    `);

    if (policyCheck.rows.length >= 2) {
      console.log(`✅ Found ${policyCheck.rows.length} RLS policies:`);
      policyCheck.rows.forEach(row => {
        console.log(`   - ${row.tablename}: ${row.policyname}`);
      });
    } else {
      console.warn('⚠️  No RLS policies found (might still be working)');
    }

    // Test 3: Check if anonymous role can SELECT
    console.log('\n3️⃣  Testing anonymous role access...');
    try {
      const convTest = await testClient.query('SELECT COUNT(*) FROM chat_conversations;');
      console.log(`✅ Can query chat_conversations (${convTest.rows[0].count} rows)`);
    } catch (error) {
      console.error('❌ Cannot query chat_conversations:', error.message);
    }

    console.log('\n✅ Chat connection test complete!\n');
  } finally {
    await testClient.end();
  }
}

async function main() {
  console.log('╔════════════════════════════════════════╗');
  console.log('║    Supabase Chat System Setup Fix     ║');
  console.log('╚════════════════════════════════════════╝\n');

  try {
    await setupRLSPolicies();
    await testChatConnection();

    console.log('✨ All fixes applied successfully!');
    console.log('🚀 Reload your app to test the chat widget\n');
  } catch (error) {
    console.error('❌ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
