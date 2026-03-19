import assert from 'node:assert/strict';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const email = process.env.SUPABASE_TEST_EMAIL;
const password = process.env.SUPABASE_TEST_PASSWORD;
const accessToken = process.env.SUPABASE_ACCESS_TOKEN;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  process.exit(1);
}

if (!accessToken && !(email && password)) {
  console.error('Provide either SUPABASE_ACCESS_TOKEN or SUPABASE_TEST_EMAIL + SUPABASE_TEST_PASSWORD.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

if (accessToken) {
  const { error } = await supabase.auth.setSession({
    access_token: accessToken,
    refresh_token: process.env.SUPABASE_REFRESH_TOKEN ?? 'unused-refresh-token',
  });

  if (error) {
    console.error('Failed to attach access token:', error.message);
    process.exit(1);
  }
} else {
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) {
    console.error('Failed to sign in:', error.message);
    process.exit(1);
  }
}

const { data: authData, error: authError } = await supabase.auth.getUser();
if (authError || !authData.user) {
  console.error('Failed to resolve authenticated user:', authError?.message ?? 'No authenticated user');
  process.exit(1);
}

const user = authData.user;
const { data: profile, error: profileError } = await supabase
  .from('profiles')
  .select('id, email, full_name, account_balance')
  .eq('id', user.id)
  .maybeSingle();

if (profileError) {
  console.error('Failed to fetch profile row:', profileError.message);
  process.exit(1);
}

assert(profile, `No public.profiles row found for auth.users.id ${user.id}`);
assert.equal(profile.id, user.id, 'public.profiles.id must match auth.users.id');

console.log(JSON.stringify({
  user: {
    id: user.id,
    email: user.email ?? null,
  },
  profile: {
    id: profile.id,
    email: profile.email,
    full_name: profile.full_name,
    account_balance: profile.account_balance,
  },
  verifiedFilter: `public.profiles.id = '${user.id}'`,
}, null, 2));
