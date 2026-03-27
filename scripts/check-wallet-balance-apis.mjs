#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = process.cwd();

const requiredRoute = join(root, 'app', 'api', 'wallets', 'balances', 'route.ts');
const legacyRoute = join(root, 'app', 'api', 'ballets', 'balances', 'route.ts');
const balancesApiSource = readIfExists(requiredRoute);
const walletsApiSource = readIfExists(join(root, 'app', 'api', 'wallets', 'route.ts'));

const errors = [];

if (!existsSync(requiredRoute)) {
  errors.push('Missing route: app/api/wallets/balances/route.ts');
}

if (existsSync(legacyRoute)) {
  errors.push('Legacy misspelled route still exists: app/api/ballets/balances/route.ts');
}

if (balancesApiSource) {
  assertRegex(
    balancesApiSource,
    /supabase\.auth\.getUser\(\)/,
    'Wallet balances API must require authenticated user via supabase.auth.getUser()'
  );
  assertRegex(
    balancesApiSource,
    /\.eq\(\s*['\"]user_id['\"]\s*,\s*user\.id\s*\)/,
    "Wallet balances API must filter balances by current user's user_id"
  );
}

if (walletsApiSource) {
  assertRegex(
    walletsApiSource,
    /supabase\.auth\.getUser\(\)/,
    'Wallets API must require authenticated user via supabase.auth.getUser()'
  );
  assertRegex(
    walletsApiSource,
    /\.eq\(\s*['\"]user_id['\"]\s*,\s*user\.id\s*\)/,
    "Wallets API must filter wallet records by current user's user_id"
  );
}

for (const file of walk(join(root, 'app'))) {
  if (!file.endsWith('.ts') && !file.endsWith('.tsx')) continue;
  const source = readFileSync(file, 'utf8');
  if (source.includes('/api/ballets/balances')) {
    errors.push(`Legacy route reference found: ${relative(root, file)}`);
  }
}

if (errors.length > 0) {
  console.error('Wallet balance API regression checks failed:\n');
  for (const error of errors) {
    console.error(`- ${error}`);
  }
  process.exit(1);
}

console.log('Wallet balance API regression checks passed.');

function readIfExists(path) {
  return existsSync(path) ? readFileSync(path, 'utf8') : null;
}

function assertRegex(source, pattern, message) {
  if (!pattern.test(source)) {
    errors.push(message);
  }
}

function walk(dir) {
  if (!existsSync(dir)) return [];

  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);

    if (stat.isDirectory()) {
      files.push(...walk(full));
    } else {
      files.push(full);
    }
  }

  return files;
}
