export {};

const BASE_URL = 'http://localhost:3000';

async function main() {
  console.log('=== B12: RATE LIMIT ENFORCEMENT PROOF (6 Consecutive Requests) ===\n');

  const testIp = '198.51.100.77';

  for (let i = 1; i <= 6; i++) {
    const res = await fetch(`${BASE_URL}/api/reader/enter`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-forwarded-for': testIp,
      },
      body: JSON.stringify({ email: `ratelimit-test-${i}-${Date.now()}@domain.com` }),
    });

    const status = res.status;
    const retryAfter = res.headers.get('retry-after');
    const remaining = res.headers.get('x-ratelimit-remaining');
    const json = await res.json().catch(() => ({}));

    console.log(`Request #${i}: Status = ${status} | Remaining = ${remaining ?? 'N/A'} | Retry-After = ${retryAfter ?? 'N/A'} | Body = ${JSON.stringify(json)}`);
  }
}

main().catch(console.error);
