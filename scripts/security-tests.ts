/**
 * VENTURE ATLAS SECURITY TEST SUITE v2
 * Covers:
 *  - All 10 admin page routes (no-cookie and va_reader cookie)
 *  - All /api/admin/* routes
 *  - Write routes: POST/PUT/DELETE on articles, blogs, case-studies, categories
 *  - POST /api/auth -> 404
 *  - GET /api/articles?status=DRAFT -> 0 rows
 *  - va_reader tamper: wrong payload, wrong secret
 *  - getCurrentUser() returns null
 *
 * Run: npx tsx --env-file=.env scripts/security-tests.ts
 * Requires: dev server running on http://localhost:3000
 */
import { signReaderToken, verifyReaderToken } from '../src/lib/auth/reader';
import { getCurrentUser } from '../src/lib/auth/staff';

const BASE_URL = 'http://localhost:3000';

let passed = 0;
let failed = 0;
const failures: string[] = [];

function pass(name: string) {
  console.log(`[PASS] ${name}`);
  passed++;
}

function fail(name: string, detail: string) {
  console.error(`[FAIL] ${name}`);
  console.error(`       Detail: ${detail}`);
  failed++;
  failures.push(name);
}

async function assertRejectsWithNoCookie(path: string) {
  try {
    const res = await fetch(`${BASE_URL}${path}`, { redirect: 'manual' });
    // Admin pages redirect to login (302/307) or return 401/403
    const ok = res.status === 401 || res.status === 403 || res.status === 302 || res.status === 307 || res.status === 308;
    if (ok) {
      pass(`NO-COOKIE: ${path} → ${res.status}`);
    } else {
      fail(`NO-COOKIE: ${path}`, `Got ${res.status} — expected 401/403 or redirect`);
    }
  } catch (e: any) {
    fail(`NO-COOKIE: ${path}`, e.message);
  }
}

async function assertRejectsWithReaderCookie(path: string, method = 'GET', body?: object) {
  const readerToken = signReaderToken({
    readerId: 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee',
    email: 'reader-attacker@evil.com',
    createdAt: new Date().toISOString(),
  });

  const opts: RequestInit = {
    method,
    redirect: 'manual',
    headers: {
      Cookie: `va_reader=${readerToken}`,
      'Content-Type': 'application/json',
    },
  };
  if (body) opts.body = JSON.stringify(body);

  try {
    const res = await fetch(`${BASE_URL}${path}`, opts);
    const ok = res.status === 401 || res.status === 403 || res.status === 302 || res.status === 307 || res.status === 308;
    if (ok) {
      pass(`VA_READER-COOKIE ${method} ${path} → ${res.status}`);
    } else {
      fail(`VA_READER-COOKIE ${method} ${path}`, `Got ${res.status} — reader must never access this`);
    }
  } catch (e: any) {
    fail(`VA_READER-COOKIE ${method} ${path}`, e.message);
  }
}

async function run() {
  console.log('====================================================');
  console.log('      VENTURE ATLAS SECURITY SUITE v2               ');
  console.log('====================================================\n');

  // ================================================================
  // SECTION A: Admin page routes with NO cookies
  // Every route must redirect or return 401/403 — never 200
  // ================================================================
  console.log('--- A: Admin pages, no cookies ---');
  const adminPages = [
    '/admin',
    '/admin/users',
    '/admin/articles',
    '/admin/articles/new',
    '/admin/articles/00000000-0000-0000-0000-000000000001/edit',
    '/admin/case-studies',
    '/admin/case-studies/new',
    '/admin/case-studies/00000000-0000-0000-0000-000000000001/edit',
    '/admin/blogs',
    '/admin/blogs/new',
    '/admin/blogs/00000000-0000-0000-0000-000000000001/edit',
    '/admin/categories',
    '/admin/media',
    '/admin/analytics',
    '/admin/audit',
  ];
  for (const page of adminPages) {
    await assertRejectsWithNoCookie(page);
  }

  // ================================================================
  // SECTION B: Admin pages + API routes with a VALID va_reader cookie
  // Reader cookie must NEVER grant access to any admin surface
  // ================================================================
  console.log('\n--- B: Admin pages, valid va_reader cookie ---');
  for (const page of adminPages) {
    await assertRejectsWithReaderCookie(page);
  }

  console.log('\n--- C: API admin routes with va_reader cookie ---');
  await assertRejectsWithReaderCookie('/api/admin/users');

  console.log('\n--- D: Content write routes with va_reader cookie ---');
  const fakeArticleBody = {
    title: 'Reader Injection',
    summary: 'Must not create',
    body: 'Content body',
    categoryId: '00000000-0000-0000-0000-000000000001',
    status: 'PUBLISHED',
  };
  await assertRejectsWithReaderCookie('/api/articles', 'POST', fakeArticleBody);
  await assertRejectsWithReaderCookie('/api/articles/00000000-0000-0000-0000-000000000001', 'PUT', { title: 'Updated' });
  await assertRejectsWithReaderCookie('/api/articles/00000000-0000-0000-0000-000000000001', 'DELETE');
  await assertRejectsWithReaderCookie('/api/blogs', 'POST', fakeArticleBody);
  await assertRejectsWithReaderCookie('/api/blogs/00000000-0000-0000-0000-000000000001', 'PUT', { title: 'Updated' });
  await assertRejectsWithReaderCookie('/api/blogs/00000000-0000-0000-0000-000000000001', 'DELETE');
  await assertRejectsWithReaderCookie('/api/case-studies', 'POST', fakeArticleBody);
  await assertRejectsWithReaderCookie('/api/case-studies/00000000-0000-0000-0000-000000000001', 'PUT', { title: 'Updated' });
  await assertRejectsWithReaderCookie('/api/case-studies/00000000-0000-0000-0000-000000000001', 'DELETE');
  await assertRejectsWithReaderCookie('/api/categories', 'POST', { name: 'Injected', slug: 'injected' });
  await assertRejectsWithReaderCookie('/api/categories/00000000-0000-0000-0000-000000000001', 'PUT', { name: 'Updated' });
  await assertRejectsWithReaderCookie('/api/categories/00000000-0000-0000-0000-000000000001', 'DELETE');

  // ================================================================
  // SECTION E: Deleted route must return 404
  // ================================================================
  console.log('\n--- E: Deleted routes return 404 ---');
  try {
    const res = await fetch(`${BASE_URL}/api/auth`, { method: 'POST', redirect: 'manual' });
    if (res.status === 404) {
      pass('POST /api/auth → 404 (route deleted)');
    } else {
      fail('POST /api/auth → 404', `Got ${res.status} — route still exists`);
    }
  } catch (e: any) {
    fail('POST /api/auth → 404', e.message);
  }

  // ================================================================
  // SECTION F: DRAFT articles invisible via public API
  // ================================================================
  console.log('\n--- F: DRAFT articles hidden from public API ---');
  try {
    const res = await fetch(`${BASE_URL}/api/articles?status=DRAFT`);
    const json = await res.json().catch(() => ({}));
    const rows: any[] = json.data ?? json.articles ?? json ?? [];
    const draftRows = Array.isArray(rows) ? rows.filter((r: any) => r.status === 'DRAFT') : [];
    if (draftRows.length === 0) {
      pass(`GET /api/articles?status=DRAFT → 0 DRAFT rows in response (got ${Array.isArray(rows) ? rows.length : '?'} total)`);
    } else {
      fail('GET /api/articles?status=DRAFT', `${draftRows.length} DRAFT rows returned — information leak`);
    }
  } catch (e: any) {
    fail('GET /api/articles?status=DRAFT', e.message);
  }

  // ================================================================
  // SECTION G: va_reader cookie tamper resistance
  // ================================================================
  console.log('\n--- G: va_reader tamper resistance ---');

  // G1: Tampered payload, original HMAC → must fail (HMAC covers original data)
  try {
    const original = signReaderToken({
      readerId: '11111111-2222-3333-4444-555555555555',
      email: 'real@example.com',
      createdAt: new Date().toISOString(),
    });
    const parts = original.split('.');
    const tamperedPayload = Buffer.from(
      JSON.stringify({ readerId: '11111111-2222-3333-4444-555555555555', email: 'hacker@evil.com', createdAt: new Date().toISOString() })
    ).toString('base64url');
    const tamperedToken = `${tamperedPayload}.${parts[1]}`;
    const result = verifyReaderToken(tamperedToken);
    if (result === null) {
      pass('G1: Tampered payload + original HMAC → verifyReaderToken returns null');
    } else {
      fail('G1: Tampered payload + original HMAC', `Got ${JSON.stringify(result)} — HMAC bypass`);
    }
  } catch (e: any) {
    fail('G1: Tampered payload + original HMAC', e.message);
  }

  // G2: Original payload, mutated signature → must fail
  try {
    const original = signReaderToken({
      readerId: '11111111-2222-3333-4444-555555555555',
      email: 'real@example.com',
      createdAt: new Date().toISOString(),
    });
    const parts = original.split('.');
    const mutatedSig = parts[1].slice(0, -4) + 'ZZZZ';
    const mutatedToken = `${parts[0]}.${mutatedSig}`;
    const result = verifyReaderToken(mutatedToken);
    if (result === null) {
      pass('G2: Original payload + mutated signature → verifyReaderToken returns null');
    } else {
      fail('G2: Original payload + mutated signature', `Got ${JSON.stringify(result)} — signature not verified`);
    }
  } catch (e: any) {
    fail('G2: Original payload + mutated signature', e.message);
  }

  // G3: Token signed with wrong secret sent to /api/admin/users → must be rejected (401/403)
  try {
    const wrongSecretPayload = Buffer.from(
      JSON.stringify({ readerId: 'ffffffff-ffff-ffff-ffff-ffffffffffff', email: 'evil@attacker.com', createdAt: new Date().toISOString() })
    ).toString('base64url');
    const fakeHmac = Buffer.from('thisisafakehmacthatisthirtytwoby', 'utf-8').toString('base64url');
    const forgedToken = `${wrongSecretPayload}.${fakeHmac}`;
    const res = await fetch(`${BASE_URL}/api/admin/users`, {
      headers: { Cookie: `va_reader=${forgedToken}` },
      redirect: 'manual',
    });
    const blocked = res.status === 401 || res.status === 403 || res.status === 302 || res.status === 307;
    if (blocked) {
      pass(`G3: va_reader signed with wrong secret → /api/admin/users returns ${res.status}`);
    } else {
      fail('G3: va_reader signed with wrong secret', `Got ${res.status}`);
    }
  } catch (e: any) {
    fail('G3: va_reader signed with wrong secret', e.message);
  }

  // ================================================================
  // SECTION H: getCurrentUser() returns null without a real session
  // ================================================================
  console.log('\n--- H: getCurrentUser() returns null with no session ---');
  try {
    const user = await getCurrentUser();
    if (user === null) {
      pass('H: getCurrentUser() with no session → null (no DEFAULT_ADMIN, no bypass)');
    } else {
      fail('H: getCurrentUser() with no session', `Returned: ${JSON.stringify(user)}`);
    }
  } catch (e: any) {
    fail('H: getCurrentUser() with no session', e.message);
  }

  // ================================================================
  // SECTION I: /api/reader/enter validity
  // ================================================================
  console.log('\n--- I: Reader enter endpoint ---');
  const uniqueTestIp = `198.51.100.${Math.floor(Math.random() * 200 + 10)}`;
  try {
    const res = await fetch(`${BASE_URL}/api/reader/enter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': uniqueTestIp },
      body: JSON.stringify({ email: `security-test-${Date.now()}@domain.com` }),
    });
    const json = await res.json();
    const setCookie = res.headers.get('set-cookie') || '';
    const hasReaderCookie = setCookie.includes('va_reader=');
    const hasNoRole = !('role' in json) && !(json.user && 'role' in json.user);
    const hasNoSupabaseCookie = !setCookie.includes('sb-') && !setCookie.includes('supabase');
    if (res.status === 200 && hasReaderCookie && hasNoRole && hasNoSupabaseCookie) {
      pass('I: POST /api/reader/enter → 200, va_reader set, no role field, no Supabase cookies');
    } else {
      fail('I: POST /api/reader/enter', `status=${res.status}, hasReaderCookie=${hasReaderCookie}, hasNoRole=${hasNoRole}, hasNoSupabaseCookie=${hasNoSupabaseCookie}`);
    }
  } catch (e: any) {
    fail('I: POST /api/reader/enter', e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/api/reader/enter`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-forwarded-for': uniqueTestIp },
      body: JSON.stringify({ email: 'not-an-email' }),
    });
    if (res.status === 400) {
      pass('I2: POST /api/reader/enter with invalid email → 400');
    } else {
      fail('I2: POST /api/reader/enter with invalid email', `Got ${res.status}`);
    }
  } catch (e: any) {
    fail('I2: POST /api/reader/enter with invalid email', e.message);
  }

  // ================================================================
  // SECTION J: Public Surface Integrity (Zero Cookies / Crawlers)
  // ================================================================
  console.log('\n--- J: Public surface integrity with NO cookies ---');
  try {
    const res = await fetch(`${BASE_URL}/`, { redirect: 'manual' });
    if (res.status === 200) {
      pass('J1: GET / with no cookies → 200 (direct public render, no redirect)');
    } else {
      fail('J1: GET / with no cookies', `Got ${res.status}, location: ${res.headers.get('location')}`);
    }
  } catch (e: any) {
    fail('J1: GET / with no cookies', e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/articles/stripe-6b-round-2027-ipo`);
    const html = await res.text();
    const hasTitle = html.includes('Stripe Closes $6.5B Round at $65B Valuation');
    const hasBody =
      html.includes('testing that editors can modify any article') ||
      html.includes('Stripe has secured') ||
      html.includes('Editor edited body content');
    if (res.status === 200 && hasTitle && hasBody) {
      pass('J2: GET published article slug with no cookies → 200 + full title & body present');
    } else {
      fail('J2: GET published article slug with no cookies', `status=${res.status}, hasTitle=${hasTitle}, hasBody=${hasBody}`);
    }
  } catch (e: any) {
    fail('J2: GET published article slug with no cookies', e.message);
  }

  const publicRoutes = ['/blogs', '/case-studies', '/categories/unicorn', '/search'];
  for (const route of publicRoutes) {
    try {
      const res = await fetch(`${BASE_URL}${route}`, { redirect: 'manual' });
      if (res.status === 200) {
        pass(`J3: GET ${route} with no cookies → 200`);
      } else {
        fail(`J3: GET ${route} with no cookies`, `Got ${res.status}, location: ${res.headers.get('location')}`);
      }
    } catch (e: any) {
      fail(`J3: GET ${route} with no cookies`, e.message);
    }
  }

  try {
    const res = await fetch(`${BASE_URL}/articles/draft-founders-fund-spacex-secondary`, { redirect: 'manual' });
    if (res.status === 404) {
      pass('J4: GET DRAFT article slug with no cookies → 404');
    } else {
      fail('J4: GET DRAFT article slug with no cookies', `Got ${res.status}`);
    }
  } catch (e: any) {
    fail('J4: GET DRAFT article slug with no cookies', e.message);
  }

  try {
    const res = await fetch(`${BASE_URL}/articles/scheduled-openai-gpt5-q4-2026`, { redirect: 'manual' });
    if (res.status === 404) {
      pass('J5: GET SCHEDULED article slug with no cookies → 404');
    } else {
      fail('J5: GET SCHEDULED article slug with no cookies', `Got ${res.status}`);
    }
  } catch (e: any) {
    fail('J5: GET SCHEDULED article slug with no cookies', e.message);
  }

  // ================================================================
  // SECTION K: Sitemap Positive Integrity (Zero Test Pollution / Zero Drafts)
  // ================================================================
  console.log('\n--- K: Sitemap Positive Integrity ---');
  try {
    const { createClient } = await import('@supabase/supabase-js');
    const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!);
    const res = await fetch(`${BASE_URL}/sitemap-articles.xml`);
    const xml = await res.text();

    const locMatches = Array.from(xml.matchAll(/<loc>(.*?)<\/loc>/g)).map(m => m[1]);
    const { data: dbArticles } = await sb.from('articles').select('id, slug, status, published_at');
    const articleMap = new Map((dbArticles || []).map(a => [a.slug, a]));

    const testPatterns = ['test', 'draft-', 'admin-draft', 'editor-edited', 'clipconnect', 'ephemeral'];
    let pollutionCount = 0;
    const now = new Date();

    for (const url of locMatches) {
      const slug = url.split('/articles/')[1];
      if (!slug) continue;

      const dbRow = articleMap.get(slug);
      if (!dbRow) {
        fail('K1: Sitemap URL not found in DB', url);
        pollutionCount++;
        continue;
      }

      if (dbRow.status !== 'PUBLISHED') {
        fail('K1: Sitemap contains non-PUBLISHED article', `${slug} status is ${dbRow.status}`);
        pollutionCount++;
      }

      if (!dbRow.published_at || new Date(dbRow.published_at) > now) {
        fail('K1: Sitemap contains future-scheduled article', `${slug} published_at is ${dbRow.published_at}`);
        pollutionCount++;
      }

      const isTestSlug = testPatterns.some(pat => slug.toLowerCase().includes(pat));
      if (isTestSlug) {
        fail('K1: Sitemap contains test slug artifact', slug);
        pollutionCount++;
      }
    }

    if (pollutionCount === 0 && locMatches.length > 0) {
      pass(`K1: Positive sitemap integrity verified — all ${locMatches.length} URLs are valid, published <= now(), and free of test patterns`);
    }
  } catch (e: any) {
    fail('K1: Sitemap positive validation', e.message);
  }

  // ================================================================
  // Summary
  // ================================================================
  console.log('\n====================================================');
  console.log(`TOTAL: ${passed + failed} tests | PASSED: ${passed} | FAILED: ${failed}`);
  if (failures.length > 0) {
    console.error('\nFAILED:');
    failures.forEach(f => console.error(`  • ${f}`));
  }
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

run().catch(err => {
  console.error('Test runner crashed:', err);
  process.exit(1);
});
