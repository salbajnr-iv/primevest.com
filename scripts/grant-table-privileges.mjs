import pg from 'pg';
import * as dotenv from 'dotenv';

dotenv.config();

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.error('❌ Missing DATABASE_URL in .env');
  process.exit(1);
}

const client = new pg.Client(databaseUrl);

async function grantTablePrivileges() {
  console.log('╔═════════════════════════════════════════════╗');
  console.log('║      Granting Table Privileges to Anon      ║');
  console.log('╚═════════════════════════════════════════════╝\n');

  await client.connect();

  try {
    console.log('🔐 Granting table-level privileges...\n');

    // Grant privileges on chat_conversations
    console.log('1️⃣  Granting privileges on chat_conversations...');
    await client.query(`
      GRANT SELECT, INSERT, UPDATE, DELETE ON chat_conversations TO anon;
    `);
    console.log('✅ SELECT, INSERT, UPDATE, DELETE granted\n');

    // Grant privileges on chat_messages
    console.log('2️⃣  Granting privileges on chat_messages...');
    await client.query(`
      GRANT SELECT, INSERT, UPDATE, DELETE ON chat_messages TO anon;
    `);
    console.log('✅ SELECT, INSERT, UPDATE, DELETE granted\n');

    // Grant sequence privileges if they exist
    console.log('3️⃣  Granting sequence privileges...');
    try {
      await client.query(`
        GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
      `);
      console.log('✅ Sequence privileges granted\n');
    } catch (_) {
      console.log('ℹ️  No sequences to grant\n');
    }

    // Verify privileges
    console.log('4️⃣  Verifying table privileges...');
    const privs = await client.query(`
      SELECT grantee, privilege_type 
      FROM role_table_grants 
      WHERE grantee = 'anon' 
      AND table_catalog = current_database()
      AND table_schema = 'public'
      ORDER BY table_name, privilege_type;
    `);

    if (privs.rows.length > 0) {
      const grouped = {};
      privs.rows.forEach(row => {
        if (!grouped[row.grantee]) grouped[row.grantee] = [];
        grouped[row.grantee].push(row.privilege_type);
      });
      
      console.log('\n✅ Anon role privileges:');
      Object.entries(grouped).forEach(([role, privs]) => {
        console.log(`   ${role}: ${privs.join(', ')}`);
      });
    }

    console.log('\n✨ All table privileges granted!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

grantTablePrivileges();
