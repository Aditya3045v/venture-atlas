import { execSync } from 'child_process';
import { checkRateLimitAsync } from '../src/lib/rate-limit';

export {};

async function main() {
  console.log('====================================================');
  console.log('   UPSTASH REDIS MULTI-PROCESS SHARED STATE TEST    ');
  console.log('====================================================\n');

  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) {
    console.warn('⚠️  NOT DONE: UPSTASH_REDIS_REST_URL or UPSTASH_REDIS_REST_TOKEN is not defined in .env.');
    console.warn('    Cannot test shared state across distributed serverless nodes without real Upstash Redis credentials.');
    process.exit(0);
  }

  const sharedKey = `shared_test_key_${Date.now()}`;
  console.log(`Testing distributed key: ${sharedKey}`);

  // Process 1: Makes 3 requests
  console.log('\n[Process 1] Making 3 hits against Upstash Redis...');
  for (let i = 1; i <= 3; i++) {
    const res = await checkRateLimitAsync(sharedKey, { windowMs: 60000, maxRequests: 5 });
    console.log(`  Process 1 hit #${i} → Remaining: ${res.remaining}, Success: ${res.success}`);
  }

  // Process 2: Spawn a separate Node child process and check that it sees remaining = 1 (hits 4 and 5)
  console.log('\n[Process 2] Spawning independent Node process to test shared state...');
  const childScript = `
    const { checkRateLimitAsync } = require('./src/lib/rate-limit');
    async function run() {
      const res = await checkRateLimitAsync('${sharedKey}', { windowMs: 60000, maxRequests: 5 });
      console.log('  Process 2 hit #1 -> Remaining: ' + res.remaining + ', Success: ' + res.success);
    }
    run();
  `;

  try {
    const output = execSync(`npx tsx --env-file=.env -e "${childScript.replace(/"/g, '\\"')}"`, { encoding: 'utf-8' });
    console.log(output);
  } catch (e: any) {
    console.error('Process 2 execution failed:', e.message);
  }
}

main().catch(console.error);
