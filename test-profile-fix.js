/**
 * Profile Save Fix - Test Script
 * 
 * This script tests if the profile save functionality works correctly
 * after applying the RLS policy fixes.
 * 
 * Usage:
 * 1. Ensure Supabase environment variables are set
 * 2. Sign in through the app flow (or set a valid Supabase auth session token in this runtime)
 * 3. Run: node test-profile-fix.js
 */

const assert = require('node:assert/strict');
const { createClient } = require('@supabase/supabase-js');

// Configuration - Replace with your actual values or use environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'YOUR_SUPABASE_URL';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'YOUR_SUPABASE_ANON_KEY';

if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
  console.log('⚠️  Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY environment variables');
  console.log('   Or edit this file to add your Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testProfileSave() {
  console.log('🧪 Testing Profile Save Functionality...\n');

  try {
    // Step 1: Check if user is authenticated
    console.log('1. Checking authentication...');
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error('❌ Auth error:', authError.message);
      return;
    }
    
    if (!user) {
      console.log('⚠️  No user authenticated. Please sign in first.');
      console.log('   This script requires a valid authenticated user session in Supabase Auth.');
      console.log('   Sign in through the app first, then re-run this script in the same authenticated context.');
      return;
    }
    
    console.log(`✅ Authenticated as user: ${user.id}`);
    console.log(`   Email: ${user.email || 'not set'}`);

    // Step 2: Test reading own profile
    console.log('\n2. Testing profile read...');
    const { data: profile, error: readError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    
    if (readError) {
      console.error('❌ Profile read error:', readError.message);
      console.log('   This might indicate RLS policy issues');
    } else {
      console.log('✅ Successfully read profile');
      console.log(`   Name: ${profile?.full_name || 'not set'}`);
      console.log(`   Phone: ${profile?.phone || 'not set'}`);
      console.log(`   Account Type: ${profile?.account_type || 'not set'}`);
    }

    // Step 3: Test upsert operation
    console.log('\n3. Testing profile upsert...');
    const testPayload = {
      id: user.id,
      full_name: profile?.full_name || 'Test User',
      phone: '+1234567890',
      account_type: 'Personal',
      updated_at: new Date().toISOString(),
    };
    
    const { data: upsertedProfile, error: upsertError } = await supabase
      .from('profiles')
      .upsert(testPayload)
      .select()
      .single();
    
    if (upsertError) {
      console.error('❌ Profile upsert error:');
      console.error('   Message:', upsertError.message);
      console.error('   Code:', upsertError.code);
      console.error('   Details:', upsertError.details || 'none');
      console.error('   Hint:', upsertError.hint || 'none');
      console.log('\n🔧 Fix: Run the SQL migration script in Supabase SQL Editor');
      console.log('   File: supabase-fix-profile-upsert.sql');
    } else {
      assert.equal(upsertedProfile.id, user.id, 'Upserted profile should match authenticated user id');
      assert.equal(upsertedProfile.phone, testPayload.phone, 'Upserted profile phone should match the payload');
      console.log('✅ Profile upsert successful!');
      console.log(`   Updated name: ${upsertedProfile.full_name}`);
      console.log(`   Updated phone: ${upsertedProfile.phone}`);
    }

    // Step 4: Test auth metadata update
    console.log('\n4. Testing auth metadata update...');
    const { error: updateMetadataError } = await supabase.auth.updateUser({
      data: {
        full_name: testPayload.full_name,
        phone: testPayload.phone,
      }
    });
    
    if (updateMetadataError) {
      console.warn('⚠️  Auth metadata update warning:', updateMetadataError.message);
    } else {
      console.log('✅ Auth metadata updated successfully');
    }

    // Summary
    console.log('\n' + '='.repeat(50));
    if (!upsertError) {
      console.log('✅ ALL TESTS PASSED');
      console.log('   Profile save functionality is working correctly!');
    } else {
      console.log('❌ UPSERT TEST FAILED');
      console.log('   Please run the SQL migration script to fix RLS policies');
    }
    console.log('='.repeat(50));

  } catch (error) {
    console.error('❌ Unexpected error:', error.message);
    console.log('\n💡 Suggestions:');
    console.log('   1. Check your Supabase URL and anon key');
    console.log('   2. Verify RLS policies are correctly configured');
    console.log('   3. Check network connection');
  }
}

// Run the test
testProfileSave();

