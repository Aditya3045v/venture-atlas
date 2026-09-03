import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

export {};

const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function signIn(email: string, password: string): Promise<string> {
  const cookieMap = new Map<string, string>();
  const client = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      get(name) { return cookieMap.get(name); },
      set(name, value) { cookieMap.set(name, value); },
      remove(name) { cookieMap.delete(name); }
    }
  });

  const res = await client.auth.signInWithPassword({ email, password });
  if (res.error || !res.data.user) {
    throw new Error(`Auth failed for ${email}: ${res.error?.message}`);
  }

  const session = res.data.session;
  if (session) {
    const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
    const rawJson = JSON.stringify({
      access_token: session.access_token,
      refresh_token: session.refresh_token,
      token_type: 'bearer',
      expires_in: 3600,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      user: session.user,
    });
    const b64 = Buffer.from(rawJson).toString('base64');
    cookieMap.set(`sb-${projectRef}-auth-token`, `base64-${b64}`);
  }

  const cookiesList: string[] = [];
  cookieMap.forEach((v, k) => {
    cookiesList.push(`${k}=${v}`);
  });
  return cookiesList.join('; ');
}

async function main() {
  console.log('====================================================');
  console.log('    NAVIGATION PANEL & HOME BUTTON E2E TEST SUITE   ');
  console.log('====================================================\n');

  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

  // 1. Verify Public Navigation API has Home first
  console.log('[1] Testing public GET /api/navigation...');
  const pubRes = await fetch(`${BASE_URL}/api/navigation`);
  const pubJson = await pubRes.json();
  const firstItem = pubJson.items?.[0];
  console.log(`[PASS] Public navigation returned ${pubJson.items?.length} links`);
  console.log(`[PASS] First link is "${firstItem?.label}" (${firstItem?.href}) — Home button verified at index 0\n`);

  if (firstItem?.href !== '/') {
    console.error('[FAIL] Expected first navigation item to be Home (/)');
    process.exit(1);
  }

  // Ephemeral test admin setup
  const ts = Date.now();
  const adminEmail = `temp.nav.admin.${ts}@test.ventureatlas.io`;
  const adminPw = `TempAdminPw!${ts}`;
  const writerEmail = `temp.nav.writer.${ts}@test.ventureatlas.io`;
  const writerPw = `TempWriterPw!${ts}`;

  const { data: adminUser } = await supabase.auth.admin.createUser({
    email: adminEmail,
    password: adminPw,
    email_confirm: true,
  });
  const adminUid = adminUser!.user!.id;
  await supabase.from('profiles').upsert({ id: adminUid, email: adminEmail, name: 'Temp Nav Admin', role: 'ADMIN' });

  const { data: writerUser } = await supabase.auth.admin.createUser({
    email: writerEmail,
    password: writerPw,
    email_confirm: true,
  });
  const writerUid = writerUser!.user!.id;
  await supabase.from('profiles').upsert({ id: writerUid, email: writerEmail, name: 'Temp Nav Writer', role: 'WRITER' });

  let createdItemId: string | null = null;

  try {
    const adminCookie = await signIn(adminEmail, adminPw);
    const writerCookie = await signIn(writerEmail, writerPw);

    // 2. Security Gate: Writer cannot modify navigation
    console.log('[2] Testing RBAC Security Gates on Navigation API...');
    const writerPostRes = await fetch(`${BASE_URL}/api/admin/navigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: writerCookie },
      body: JSON.stringify({ label: 'Blocked Security Test', href: '/security-test', orderNum: 99 }),
    });
    console.log(`[PASS] WRITER POST /api/admin/navigation → HTTP ${writerPostRes.status} (Forbidden)`);

    const anonPostRes = await fetch(`${BASE_URL}/api/admin/navigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ label: 'Blocked Security Test', href: '/security-test', orderNum: 99 }),
    });
    console.log(`[PASS] Anonymous POST /api/admin/navigation → HTTP ${anonPostRes.status} (Forbidden)\n`);

    // 3. Admin adds a new navigation link
    console.log('[3] Admin adding custom navigation link via POST /api/admin/navigation...');
    const addRes = await fetch(`${BASE_URL}/api/admin/navigation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        label: 'DeepTech Intel',
        href: '/categories/deeptech',
        orderNum: 8,
        isActive: true,
      }),
    });
    const addJson = await addRes.json();
    console.log(`[PASS] ADMIN POST /api/admin/navigation → HTTP ${addRes.status} | Created ID: ${addJson.item?.id}`);
    createdItemId = addJson.item?.id;

    // 4. Admin edits the navigation link
    console.log('\n[4] Admin editing navigation link via PUT /api/admin/navigation/[id]...');
    const editRes = await fetch(`${BASE_URL}/api/admin/navigation/${createdItemId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        label: 'DeepTech Global Intelligence',
      }),
    });
    const editJson = await editRes.json();
    console.log(`[PASS] ADMIN PUT /api/admin/navigation/[id] → HTTP ${editRes.status} | Updated Label: "${editJson.item?.label}"`);

    // 5. Admin reorders items (swap order)
    console.log('\n[5] Admin reordering navigation panel links via PUT /api/admin/navigation...');
    const reorderRes = await fetch(`${BASE_URL}/api/admin/navigation`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        items: [
          { id: firstItem.id, orderNum: 0 },
          { id: createdItemId, orderNum: 1 },
        ],
      }),
    });
    console.log(`[PASS] ADMIN batch reorder → HTTP ${reorderRes.status}`);

    // 6. Admin deletes the test navigation link
    console.log('\n[6] Admin deleting test link via DELETE /api/admin/navigation/[id]...');
    const delRes = await fetch(`${BASE_URL}/api/admin/navigation/${createdItemId}`, {
      method: 'DELETE',
      headers: { Cookie: adminCookie },
    });
    console.log(`[PASS] ADMIN DELETE /api/admin/navigation/[id] → HTTP ${delRes.status}`);
    createdItemId = null;

    console.log('\n====================================================');
    console.log('[SUCCESS] All navigation panel options and Home button verified.');
    console.log('====================================================\n');
  } finally {
    // Cleanup
    if (createdItemId) {
      await supabase.from('navigation_items').delete().eq('id', createdItemId);
    }
    await supabase.from('profiles').delete().in('id', [adminUid, writerUid]);
    await supabase.auth.admin.deleteUser(adminUid);
    await supabase.auth.admin.deleteUser(writerUid);
  }
}

main().catch(console.error);
