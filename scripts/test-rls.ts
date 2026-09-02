/**
 * RLS PROOF SCRIPT (scripts/test-rls.ts)
 * Tests Postgres Row Level Security enforcement with the ANON key ONLY.
 * Every one of these must be DENIED BY THE DATABASE, not by application code.
 * Run: npx tsx --env-file=.env scripts/test-rls.ts
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in environment.');
  process.exit(1);
}

// ANON client — no session, no auth header
const anon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

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

async function run() {
  console.log('====================================================');
  console.log('       SUPABASE POSTGRES RLS PROOF TEST SUITE       ');
  console.log('       Anon key only — DB-level enforcement only    ');
  console.log('====================================================\n');

  // ----------------------------------------------------------------
  // 1. Anon SELECT on DRAFT articles → must return 0 rows
  // ----------------------------------------------------------------
  {
    const { data, error } = await anon
      .from('articles')
      .select('id, title, status')
      .eq('status', 'DRAFT');
    if (error) {
      pass('1. Anon SELECT DRAFT articles → BLOCKED (error returned)');
    } else if (!data || data.length === 0) {
      pass('1. Anon SELECT DRAFT articles → 0 rows returned (hidden by RLS)');
    } else {
      fail('1. Anon SELECT DRAFT articles', `${data.length} DRAFT rows returned — LIVE VULNERABILITY`);
      console.error('   Leaked rows:', JSON.stringify(data.slice(0, 3)));
    }
  }

  // ----------------------------------------------------------------
  // 2. Anon SELECT on newsletter_subscribers → must be denied
  // ----------------------------------------------------------------
  {
    const { data, error } = await anon
      .from('newsletter_subscribers')
      .select('id, email');
    if (error) {
      pass('2. Anon SELECT newsletter_subscribers → BLOCKED (error)');
    } else if (!data || data.length === 0) {
      pass('2. Anon SELECT newsletter_subscribers → 0 rows (hidden by RLS)');
    } else {
      fail('2. Anon SELECT newsletter_subscribers', `${data.length} subscriber rows returned — LIVE VULNERABILITY`);
    }
  }

  // ----------------------------------------------------------------
  // 3. Anon UPDATE another user's profiles row → must be blocked
  // ----------------------------------------------------------------
  {
    const { data, error } = await anon
      .from('profiles')
      .update({ name: 'HACKED' })
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select();
    if (error) {
      pass('3. Anon UPDATE foreign profiles row → BLOCKED (error)');
    } else if (!data || data.length === 0) {
      pass('3. Anon UPDATE foreign profiles row → 0 rows updated (RLS prevented)');
    } else {
      fail('3. Anon UPDATE foreign profiles row', `Updated ${data.length} rows — LIVE VULNERABILITY`);
    }
  }

  // ----------------------------------------------------------------
  // 4. Anon UPDATE own profiles row setting role='ADMIN' → must be blocked
  //    (anon has no uid() so no "own" row — and even if it did, the trigger prevents role change)
  // ----------------------------------------------------------------
  {
    const { data, error } = await anon
      .from('profiles')
      .update({ role: 'ADMIN' })
      .eq('id', '00000000-0000-0000-0000-000000000000')
      .select();
    if (error) {
      pass('4. Anon UPDATE profiles.role=ADMIN → BLOCKED (error)');
    } else if (!data || data.length === 0) {
      pass('4. Anon UPDATE profiles.role=ADMIN → 0 rows updated (RLS prevented)');
    } else {
      fail('4. Anon UPDATE profiles.role=ADMIN', `Updated ${data.length} profile(s) — LIVE VULNERABILITY`);
    }
  }

  // ----------------------------------------------------------------
  // 5. Anon SELECT on audit_logs → must be denied
  // ----------------------------------------------------------------
  {
    const { data, error } = await anon
      .from('audit_logs')
      .select('id, action, actor_email')
      .limit(5);
    if (error) {
      pass('5. Anon SELECT audit_logs → BLOCKED (error)');
    } else if (!data || data.length === 0) {
      pass('5. Anon SELECT audit_logs → 0 rows (hidden by RLS)');
    } else {
      fail('5. Anon SELECT audit_logs', `${data.length} audit rows returned — LIVE VULNERABILITY`);
    }
  }

  // ----------------------------------------------------------------
  // 6. Anon UPDATE a comment to status='APPROVED' → must be blocked
  // ----------------------------------------------------------------
  {
    const { data, error } = await anon
      .from('comments')
      .update({ status: 'APPROVED' })
      .eq('status', 'PENDING')
      .select();
    if (error) {
      pass('6. Anon UPDATE comment status=APPROVED → BLOCKED (error)');
    } else if (!data || data.length === 0) {
      pass('6. Anon UPDATE comment status=APPROVED → 0 rows updated (RLS prevented)');
    } else {
      fail('6. Anon UPDATE comment status=APPROVED', `Updated ${data.length} comment(s) — LIVE VULNERABILITY`);
    }
  }

  // ----------------------------------------------------------------
  // 7. Anon DELETE another reader's bookmark → must be blocked
  // ----------------------------------------------------------------
  {
    const { data, error } = await anon
      .from('bookmarks')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000')
      .select();
    if (error) {
      pass('7. Anon DELETE foreign bookmark → BLOCKED (error)');
    } else if (!data || data.length === 0) {
      pass('7. Anon DELETE foreign bookmark → 0 rows deleted (RLS prevented)');
    } else {
      fail('7. Anon DELETE foreign bookmark', `Deleted ${data.length} bookmark(s) — LIVE VULNERABILITY`);
    }
  }

  // ----------------------------------------------------------------
  // 8. Anon INSERT directly into audit_logs → must be blocked
  //    Policy says INSERT WITH CHECK (true) — this is a REAL vulnerability
  //    if it succeeds. The test proves it one way or the other.
  // ----------------------------------------------------------------
  {
    const { error } = await anon
      .from('audit_logs')
      .insert({
        actor_email: 'attacker@evil.com',
        actor_role: 'ADMIN',
        action: 'INJECTED_AUDIT_LOG',
        entity_type: 'ATTACK',
        entity_id: '00000000-0000-0000-0000-000000000000',
        metadata: { injected: true },
      });
    if (error) {
      pass('8. Anon INSERT into audit_logs → BLOCKED (error)');
    } else {
      fail('8. Anon INSERT into audit_logs', 'INSERT SUCCEEDED — policy allows anon INSERT — VULNERABILITY');
    }
  }

  // ----------------------------------------------------------------
  // 9. Anon INSERT into articles → must be blocked
  // ----------------------------------------------------------------
  {
    const { error } = await anon
      .from('articles')
      .insert({
        title: 'Injected Article',
        slug: 'injected-article-rls-test',
        summary: 'RLS violation test',
        body: 'Should never insert',
        status: 'PUBLISHED',
        category_id: '00000000-0000-0000-0000-000000000001',
      });
    if (error) {
      pass('9. Anon INSERT into articles → BLOCKED (error)');
    } else {
      fail('9. Anon INSERT into articles', 'INSERT SUCCEEDED — LIVE VULNERABILITY');
    }
  }

  // ----------------------------------------------------------------
  // 10. Anon INSERT into profiles → must be blocked
  // ----------------------------------------------------------------
  {
    const { error } = await anon
      .from('profiles')
      .insert({
        id: '00000000-0000-0000-0000-000000000002',
        email: 'injected@evil.com',
        name: 'Injected Admin',
        role: 'ADMIN',
      });
    if (error) {
      pass('10. Anon INSERT into profiles → BLOCKED (error)');
    } else {
      fail('10. Anon INSERT into profiles', 'INSERT SUCCEEDED — LIVE VULNERABILITY');
    }
  }

  // ----------------------------------------------------------------
  // 11. Anon SELECT on PUBLISHED articles → MUST SUCCEED (crawler check)
  // ----------------------------------------------------------------
  {
    const { data, error } = await anon
      .from('articles')
      .select('id, title, status')
      .eq('status', 'PUBLISHED');
    if (!error && data && data.length >= 10) {
      pass(`11. Anon SELECT PUBLISHED articles → ALLOWED (${data.length} rows returned) — correct`);
    } else if (!error && data) {
      pass(`11. Anon SELECT PUBLISHED articles → ALLOWED (${data.length} rows returned) — correct`);
    } else {
      fail('11. Anon SELECT PUBLISHED articles', error?.message || 'No data returned');
    }
  }

  // ----------------------------------------------------------------
  // Summary
  // ----------------------------------------------------------------
  console.log('\n====================================================');
  console.log(`RLS SUITE: ${passed + failed} tests | ${passed} passed | ${failed} failed`);
  if (failures.length > 0) {
    console.error('\nFAILED TESTS (LIVE VULNERABILITIES):');
    failures.forEach(f => console.error(`  • ${f}`));
  }
  console.log('====================================================');

  if (failed > 0) process.exit(1);
}

run().catch(e => {
  console.error('RLS test runner crashed:', e);
  process.exit(1);
});
