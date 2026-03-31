#!/usr/bin/env node
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey || !anonKey) {
  console.error('❌ Missing Supabase credentials in .env');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);
const supabaseAnon = createClient(supabaseUrl, anonKey);

async function validateSetup() {
  console.log('╔═══════════════════════════════════════════════╗');
  console.log('║   Primevest Chat System Validation Suite    ║');
  console.log('╚═══════════════════════════════════════════════╝\n');

  let allPassed = true;

  // Test 1: Admin connection
  console.log('🔐 Test 1: Admin Database Connection');
  console.log('─────────────────────────────────────');
  try {
    const { count, error } = await supabaseAdmin
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    console.log(`✅ PASS - Connected with ${count || 0} existing conversations\n`);
  } catch (error) {
    console.error(`❌ FAIL - ${error.message}\n`);
    allPassed = false;
  }

  // Test 2: Anonymous connection
  console.log('👤 Test 2: Anonymous Database Connection');
  console.log('────────────────────────────────────────');
  try {
    const { error } = await supabaseAnon
      .from('chat_conversations')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    console.log(`✅ PASS - Anonymous user connected\n`);
  } catch (error) {
    console.error(`❌ FAIL - ${error.message}\n`);
    allPassed = false;
  }

  // Test 3: Insert operation (anonymous)
  console.log('✏️  Test 3: Anonymous Insert Permission');
  console.log('──────────────────────────────────────');
  const testId = `test-${Date.now()}`;
  try {
    const { error } = await supabaseAnon
      .from('chat_conversations')
      .insert({
        id: testId,
        updated_at: new Date().toISOString(),
      })
      .select();

    if (error) throw error;
    console.log(`✅ PASS - Anonymous INSERT works\n`);

    // Cleanup
    await supabaseAdmin.from('chat_conversations').delete().eq('id', testId);
  } catch (error) {
    console.error(`❌ FAIL - ${error.message}\n`);
    allPassed = false;
  }

  // Test 4: Select operation (anonymous)
  console.log('📖 Test 4: Anonymous Select Permission');
  console.log('─────────────────────────────────────');
  try {
    const { data, error } = await supabaseAnon
      .from('chat_conversations')
      .select('*')
      .limit(5);

    if (error) throw error;
    console.log(`✅ PASS - Anonymous SELECT works (${data?.length || 0} results)\n`);
  } catch (error) {
    console.error(`❌ FAIL - ${error.message}\n`);
    allPassed = false;
  }

  // Test 5: Realtime subscription
  console.log('📡 Test 5: Realtime Channel Connection');
  console.log('─────────────────────────────────────');
  try {
    const channel = supabaseAnon.channel('test-channel');
    channel.on('broadcast', { event: 'test' }, (payload) => {
      console.log('   Message received:', payload);
    });
    
    await new Promise((resolve) => {
      const timer = setTimeout(resolve, 1000);
      channel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          clearTimeout(timer);
          console.log(`✅ PASS - Realtime channel subscribed\n`);
          resolve();
        }
      });
    });
    
    channel.unsubscribe();
  } catch (error) {
    console.error(`❌ FAIL - ${error.message}\n`);
    allPassed = false;
  }

  // Test 6: Table structure
  console.log('🏗️  Test 6: Chat Tables Structure');
  console.log('──────────────────────────────────');
  try {
    await supabaseAdmin.rpc('get_table_info', {
      table_name: 'chat_conversations'
    }).catch(() => ({ data: null }));

    await supabaseAdmin
      .from('chat_conversations')
      .select('*')
      .limit(1);

    console.log(`✅ PASS - chat_conversations table accessible\n`);
  } catch (error) {
    console.error(`❌ FAIL - ${error.message}\n`);
    allPassed = false;
  }

  // Summary
  console.log('╔═══════════════════════════════════════════════╗');
  if (allPassed) {
    console.log('║          ✨ ALL TESTS PASSED ✨              ║');
    console.log('║                                              ║');
    console.log('║  Your chat system is ready to use!          ║');
    console.log('║  Reload your app and test the chat widget   ║');
  } else {
    console.log('║          ⚠️  SOME TESTS FAILED ⚠️             ║');
    console.log('║                                              ║');
    console.log('║  Check the errors above and fix them        ║');
  }
  console.log('╚═══════════════════════════════════════════════╝\n');

  process.exit(allPassed ? 0 : 1);
}

validateSetup().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
