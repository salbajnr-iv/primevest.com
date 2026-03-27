/**
 * Test script for Ledger Idempotency.
 * 
 * This script calls the /api/ledger/transfer endpoint with the same idempotency_key 
 * 100 times in parallel. Only the first one should succeed in creating a transfer, 
 * and others should return 'already_executed: true'.
 * 
 * NOTE: Requires a valid Admin access token as Bearer.
 */

const ENDPOINT = 'http://localhost:3000/api/ledger/transfer';
const BEARER_TOKEN = 'PASTE_YOUR_ADMIN_TOKEN_HERE';

const idempotency_key = `test-key-${Date.now()}`;
const payload = {
  from_wallet_id: 'SYSTEM_WALLET_ID', 
  to_wallet_id: 'TARGET_WALLET_ID',
  asset: 'EUR',
  network: 'mainnet',
  amount: '10.00',
  idempotency_key: idempotency_key,
  metadata: { test: true }
};

async function runTest() {
  console.log(`Starting idempotency test with key: ${idempotency_key}`);
  
  const requests = Array.from({ length: 100 }).map(async (_, i) => {
    try {
      const start = Date.now();
      const res = await fetch(ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BEARER_TOKEN}`
        },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      const end = Date.now();
      
      return { 
        status: res.status, 
        data, 
        duration: end - start 
      };
    } catch (err) {
      return { error: err.message };
    }
  });

  const results = await Promise.all(requests);
  
  const successes = results.filter(r => r.status === 200 && !r.data.already_executed).length;
  const alreadyExecuted = results.filter(r => r.status === 200 && r.data.already_executed).length;
  const errors = results.filter(r => r.status !== 200).length;

  console.log('--- Test Results ---');
  console.log(`Total Requests: 100`);
  console.log(`Fresh Successes: ${successes} (Should be 1)`);
  console.log(`Already Executed: ${alreadyExecuted} (Should be 99)`);
  console.log(`Errors: ${errors}`);
  
  if (successes !== 1) {
    console.error('CRITICAL: Idempotency check failed! More than one request was processed.');
  } else {
    console.log('SUCCESS: Idempotency check passed.');
  }
}

// Only run if bearer is provided
if (BEARER_TOKEN !== 'PASTE_YOUR_ADMIN_TOKEN_HERE') {
  runTest();
} else {
  console.log('Skipping automated run. Please provide a BEARER_TOKEN in the script to test.');
}
