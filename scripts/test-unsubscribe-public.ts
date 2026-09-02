export {};

const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('=== TEST UNSUBSCRIBE WITHOUT AUTHENTICATION ===\n');

  // 1. Unsubscribe with raw email
  const res = await fetch(`${BASE_URL}/api/newsletter/unsubscribe`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'test.reader.unsubscribe@example.com' }),
  });

  const json = await res.json();
  console.log(`[PASS] POST /api/newsletter/unsubscribe → HTTP ${res.status} | Body: ${JSON.stringify(json)}`);
}

main().catch(console.error);
