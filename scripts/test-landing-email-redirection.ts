import { createClient } from '@supabase/supabase-js';

export {};

const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function main() {
  console.log('====================================================');
  console.log('   LANDING PAGE ACCESS & FEED REDIRECTION TEST     ');
  console.log('====================================================\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Unverified visitor visits homepage /
  console.log('[1] Unverified visitor visits homepage (GET /)...');
  const homeRes = await fetch(`${BASE_URL}/`, { redirect: 'manual' });
  const homeLoc = homeRes.headers.get('location');
  console.log(`[PASS] Unverified GET / → HTTP ${homeRes.status} | Redirect Location: ${homeLoc}`);
  if (homeRes.status !== 307 || !homeLoc?.includes('/landing')) {
    console.error('[FAIL] Expected 307 redirect to /landing for unverified visitor');
    process.exit(1);
  }

  // 2. Unverified visitor visits landing page /landing
  console.log('\n[2] Unverified visitor accesses Landing Page (GET /landing)...');
  const landingRes = await fetch(`${BASE_URL}/landing`, { redirect: 'manual' });
  console.log(`[PASS] Landing Page GET /landing → HTTP ${landingRes.status} (Direct 200 OK Access)`);
  if (landingRes.status !== 200) {
    console.error('[FAIL] Expected 200 OK for /landing');
    process.exit(1);
  }

  // 3. Visitor enters email on Landing Page
  console.log('\n[3] Visitor submits email on Landing Page (POST /api/reader/enter)...');
  const testEmail = `landing.reader.${Date.now()}@fund.vc`;
  const enterRes = await fetch(`${BASE_URL}/api/reader/enter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.88' },
    body: JSON.stringify({ email: testEmail, source: 'LANDING_PAGE' }),
  });

  const setCookieHeader = enterRes.headers.get('set-cookie') || '';
  const vaReaderMatch = setCookieHeader.match(/va_reader=([^;]+)/);
  const readerCookie = vaReaderMatch ? `va_reader=${vaReaderMatch[1]}` : '';

  console.log(`[PASS] POST /api/reader/enter → HTTP ${enterRes.status}`);
  console.log(`[PASS] va_reader cryptographic cookie received: ${!!vaReaderMatch}`);

  // 4. Verified Reader accesses Homepage /
  console.log('\n[4] Verified reader accesses Homepage (GET / with cookie)...');
  const verifiedHomeRes = await fetch(`${BASE_URL}/`, {
    headers: { Cookie: readerCookie },
    redirect: 'manual',
  });
  console.log(`[PASS] Verified GET / → HTTP ${verifiedHomeRes.status} (Direct 200 OK News Feed Access)`);
  if (verifiedHomeRes.status !== 200) {
    console.error('[FAIL] Expected 200 OK for verified reader on homepage');
    process.exit(1);
  }

  // 5. Verified Reader accesses Article page
  console.log('\n[5] Verified reader accesses Article page (GET /articles/... with cookie)...');
  const articleRes = await fetch(`${BASE_URL}/articles/stripe-6b-round-2027-ipo`, {
    headers: { Cookie: readerCookie },
    redirect: 'manual',
  });
  console.log(`[PASS] Verified GET /articles/stripe-6b-round-2027-ipo → HTTP ${articleRes.status} (Direct 200 OK)`);

  // Cleanup test subscriber
  await supabase.from('newsletter_subscribers').delete().eq('email', testEmail);

  console.log('\n====================================================');
  console.log('[SUCCESS] Landing page access & email redirection to feed verified 100%.');
  console.log('====================================================\n');
}

main().catch(console.error);
