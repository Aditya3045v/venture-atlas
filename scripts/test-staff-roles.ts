/**
 * scripts/test-staff-roles.ts
 *
 * Tests staff role enforcement with REAL authenticated HTTP requests.
 * Signs in as WRITER, EDITOR, and ADMIN via Supabase Auth, obtains session cookies,
 * makes actual API calls, then verifies database state afterward with the service key.
 *
 * Run: npx tsx --env-file=.env scripts/test-staff-roles.ts
 * Requires: dev server running on http://localhost:3000
 */
import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';
import crypto from 'crypto';

function generateTOTP(secretBase32: string): string {
  const base32chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  let bits = '';
  for (let i = 0; i < secretBase32.length; i++) {
    const val = base32chars.indexOf(secretBase32.charAt(i).toUpperCase());
    if (val !== -1) bits += val.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substr(i, 8), 2));
  }
  const key = Buffer.from(bytes);
  const epoch = Math.floor(Date.now() / 1000);
  const time = Buffer.alloc(8);
  time.writeBigInt64BE(BigInt(Math.floor(epoch / 30)));
  const hmac = crypto.createHmac('sha1', key).update(time).digest();
  const offset = hmac[hmac.length - 1] & 0xf;
  const code = (hmac.readUInt32BE(offset) & 0x7fffffff) % 1000000;
  return code.toString().padStart(6, '0');
}

const BASE_URL     = 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SERVICE_KEY) {
  console.error('Missing required env vars'); process.exit(1);
}

const serviceDb = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });

let passed = 0; let failed = 0;
const failures: string[] = [];

function pass(name: string) { console.log(`  [PASS] ${name}`); passed++; }
function fail(name: string, detail: string) {
  console.error(`  [FAIL] ${name}`);
  console.error(`         ${detail}`);
  failed++; failures.push(name);
}

// Dynamic ephemeral test credentials
const testNonce = Date.now();
const WRITER_EMAIL = `temp.writer.${testNonce}@test.ventureatlas.in`;
const EDITOR_EMAIL = `temp.editor.${testNonce}@test.ventureatlas.in`;
const ADMIN_EMAIL  = `temp.admin.${testNonce}@test.ventureatlas.in`;

const WRITER_PW = `WriterTempPass!${testNonce}`;
const EDITOR_PW = `EditorTempPass!${testNonce}`;
const ADMIN_PW  = `AdminTempPass!${testNonce}`;

let WRITER_ID = '';
let EDITOR_ID = '';
let ADMIN_ID  = '';

const ephemeralArticleIds: string[] = [];
const ephemeralCommentIds: string[] = [];
const ephemeralUserIds: string[] = [];

async function cleanupEphemeralFixtures() {
  for (const id of ephemeralArticleIds) {
    try { await serviceDb.from('articles').delete().eq('id', id); } catch {}
  }
  for (const id of ephemeralCommentIds) {
    try { await serviceDb.from('comments').delete().eq('id', id); } catch {}
  }
  const idsToDelete = [WRITER_ID, EDITOR_ID, ADMIN_ID, ...ephemeralUserIds].filter(Boolean);
  for (const id of idsToDelete) {
    try {
      await serviceDb.from('profiles').delete().eq('id', id);
      await serviceDb.auth.admin.deleteUser(id);
    } catch {}
  }
}

async function createTempStaffUser(email: string, pass: string, role: string, name: string) {
  const { data: userRes, error: createErr } = await serviceDb.auth.admin.createUser({
    email,
    password: pass,
    email_confirm: true,
    user_metadata: { name },
  });
  if (createErr || !userRes.user) {
    throw new Error(`Failed to create temp ${role}: ${createErr?.message}`);
  }
  const uid = userRes.user.id;
  await serviceDb.from('profiles').upsert({
    id: uid,
    email,
    name,
    role,
  });
  return uid;
}

// Sign in via @supabase/ssr and return serialized Cookie header string
async function signIn(email: string, password: string): Promise<{ cookieHeader: string; client: any }> {
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
  return { cookieHeader: cookiesList.join('; '), client };
}

async function apiCall(method: string, path: string, sessionCookie: string, body?: object): Promise<{ status: number; json: any }> {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Cookie: sessionCookie,
    },
    body: body ? JSON.stringify(body) : undefined,
    redirect: 'manual',
  });
  const json = await res.json().catch(() => ({}));
  return { status: res.status, json };
}

async function getFirstPublishedArticle(authorId?: string) {
  let q = serviceDb.from('articles').select('id, slug, author_id, status').eq('status', 'PUBLISHED');
  if (authorId) q = q.eq('author_id', authorId);
  const { data } = await q.limit(1).single();
  return data;
}

async function getFirstDraftArticle(authorId?: string) {
  let q = serviceDb.from('articles').select('id, slug, author_id, status').eq('status', 'DRAFT');
  if (authorId) q = q.eq('author_id', authorId);
  const { data } = await q.limit(1).single();
  return data;
}

async function getDbRow(table: string, id: string) {
  const { data } = await serviceDb.from(table).select('*').eq('id', id).single();
  return data;
}

async function getCategoryId() {
  const { data } = await serviceDb.from('categories').select('id').limit(1).single();
  return data?.id;
}

async function run() {
  console.log('====================================================');
  console.log('   STAFF ROLE ENFORCEMENT — REAL HTTP TEST SUITE   ');
  console.log('====================================================\n');

  // Capture before-snapshot
  const { data: initialArticles } = await serviceDb.from('articles').select('id, slug, title, status, summary, word_count, read_time_minutes, author_id, updated_at').order('id');
  const { data: initialBlogs } = await serviceDb.from('blog_posts').select('id, slug, title, status, author_id, updated_at').order('id');
  const { data: initialCases } = await serviceDb.from('case_studies').select('id, slug, title, status, author_id, updated_at').order('id');

  let adminDraft: any = null;
  let adminPublished: any = null;
  let adminDraftToPublish: any = null;

  try {
    console.log('Creating ephemeral test staff accounts in Supabase Auth...');
    WRITER_ID = await createTempStaffUser(WRITER_EMAIL, WRITER_PW, 'WRITER', 'Temp Writer');
    EDITOR_ID = await createTempStaffUser(EDITOR_EMAIL, EDITOR_PW, 'EDITOR', 'Temp Editor');
    ADMIN_ID  = await createTempStaffUser(ADMIN_EMAIL, ADMIN_PW, 'ADMIN', 'Temp Admin');

    const categoryId = await getCategoryId();
    if (!categoryId) { console.error('No categories found — run seed-content.ts first'); process.exit(1); }

    // ================================================================
    // SIGN IN as each role
    // ================================================================
    let writerCookie: string, writerClient: any;
    let editorCookie: string, editorClient: any;
    let adminCookie: string, adminClient: any;

    try {
      const w = await signIn(WRITER_EMAIL, WRITER_PW);
      writerCookie = w.cookieHeader;
      writerClient = w.client;
      console.log('Signed in as WRITER');
    } catch (e: any) { console.error(`FATAL: Cannot sign in as WRITER: ${e.message}`); process.exit(1); }

    try {
      const ed = await signIn(EDITOR_EMAIL, EDITOR_PW);
      editorCookie = ed.cookieHeader;
      editorClient = ed.client;
      console.log('Signed in as EDITOR');
    } catch (e: any) { console.error(`FATAL: Cannot sign in as EDITOR: ${e.message}`); process.exit(1); }

    try {
      const a = await signIn(ADMIN_EMAIL, ADMIN_PW);
      adminCookie = a.cookieHeader;
      adminClient = a.client;
      console.log('Signed in as ADMIN\n');
    } catch (e: any) { console.error(`FATAL: Cannot sign in as ADMIN: ${e.message}`); process.exit(1); }

    // 1. Admin-authored draft for W5, E1, E2
    const res1 = await serviceDb.from('articles').insert({
      title: 'Ephemeral Admin Draft ' + testNonce,
      slug: 'ephemeral-admin-draft-' + testNonce,
      summary: 'Summary for admin draft testing sixty words count here to validate permissions.',
      body: 'Body content for admin draft testing.',
      status: 'DRAFT',
      author_id: ADMIN_ID,
      category_id: categoryId,
    }).select().single();
    adminDraft = res1.data;
    if (adminDraft) ephemeralArticleIds.push(adminDraft.id);

    // 2. Admin-authored published article for W6, E3, CM
    const res2 = await serviceDb.from('articles').insert({
      title: 'Ephemeral Admin Published ' + testNonce,
      slug: 'ephemeral-admin-published-' + testNonce,
      summary: 'Summary for admin published article testing sixty words count here to validate permissions.',
      body: 'Body content for admin published article testing.',
      status: 'PUBLISHED',
      published_at: new Date().toISOString(),
      author_id: ADMIN_ID,
      category_id: categoryId,
    }).select().single();
    adminPublished = res2.data;
    if (adminPublished) ephemeralArticleIds.push(adminPublished.id);

    // 3. Admin-authored draft for A3 publishing test
    const res3 = await serviceDb.from('articles').insert({
      title: 'Ephemeral Admin Draft For A3 ' + testNonce,
      slug: 'ephemeral-admin-draft-a3-' + testNonce,
      summary: 'Summary for admin draft for publishing test sixty words count here to validate permissions.',
      body: 'Body content for admin draft publishing test.',
      status: 'DRAFT',
      author_id: ADMIN_ID,
      category_id: categoryId,
    }).select().single();
    adminDraftToPublish = res3.data;
    if (adminDraftToPublish) ephemeralArticleIds.push(adminDraftToPublish.id);

  // ================================================================
  // SECTION W: WRITER assertions
  // ================================================================
  console.log('--- WRITER ---');

  // W1: WRITER can POST a DRAFT article
  let writerDraftId: string | null = null;
  {
    const { status, json } = await apiCall('POST', '/api/articles', writerCookie, {
      title: 'Writer Test Draft Article ' + Date.now(),
      summary: 'This is a sixty-word summary from the writer test account that exists solely to verify role enforcement during automated testing of the venture atlas platform.',
      body: 'Test body content with more than twenty characters for validation.',
      categoryId,
      status: 'DRAFT',
    });
    if (status === 201 && json.article?.id) {
      writerDraftId = json.article.id;
      ephemeralArticleIds.push(writerDraftId!);
      const row = await getDbRow('articles', writerDraftId!);
      if (row?.status === 'DRAFT' && row?.author_id === WRITER_ID) {
        pass('W1: WRITER POST /api/articles (DRAFT) → 201, DB row is DRAFT, author_id = WRITER');
      } else {
        fail('W1: WRITER POST /api/articles (DRAFT)', `DB row: ${JSON.stringify(row)}`);
      }
    } else {
      fail('W1: WRITER POST /api/articles (DRAFT)', `status=${status}, body=${JSON.stringify(json)}`);
    }
  }

  // W2: WRITER CANNOT post a PUBLISHED article directly
  {
    const { status } = await apiCall('POST', '/api/articles', writerCookie, {
      title: 'Writer Publish Attempt ' + Date.now(),
      summary: 'Writer attempting to publish without editor approval which is strictly forbidden by role enforcement in the venture atlas platform security model.',
      body: 'Test body content with more than twenty characters for validation.',
      categoryId,
      status: 'PUBLISHED',
    });
    if (status === 403) {
      pass('W2: WRITER POST /api/articles (PUBLISHED) → 403');
    } else {
      fail('W2: WRITER POST /api/articles (PUBLISHED)', `Got ${status}`);
    }
  }

  // W3: WRITER can PUT own draft
  if (writerDraftId) {
    const { status } = await apiCall('PUT', `/api/articles/${writerDraftId}`, writerCookie, {
      title: 'Writer Test Draft Article (edited) ' + Date.now(),
      summary: 'This is an edited sixty-word summary from the writer test account verifying that writers can update their own draft articles within the venture atlas platform.',
      body: 'Edited body content with more than twenty characters for validation.',
      categoryId,
      status: 'DRAFT',
    });
    if (status === 200) {
      const row = await getDbRow('articles', writerDraftId);
      if (row?.title?.includes('(edited)')) {
        pass('W3: WRITER PUT own draft → 200, DB row updated');
      } else {
        fail('W3: WRITER PUT own draft', `Row title: ${row?.title}`);
      }
    } else {
      fail('W3: WRITER PUT own draft', `status=${status}`);
    }
  } else {
    fail('W3: WRITER PUT own draft', 'skipped — no draft article id from W1');
  }

  // W4: WRITER CANNOT PATCH status to PUBLISHED
  if (writerDraftId) {
    const { status } = await apiCall('PATCH', `/api/articles/${writerDraftId}/status`, writerCookie, { status: 'PUBLISHED' });
    if (status === 403) {
      const row = await getDbRow('articles', writerDraftId);
      if (row?.status === 'DRAFT') {
        pass('W4: WRITER PATCH /status PUBLISHED → 403, DB row still DRAFT');
      } else {
        fail('W4: WRITER PATCH /status PUBLISHED', `DB row status changed to: ${row?.status}`);
      }
    } else {
      fail('W4: WRITER PATCH /status PUBLISHED', `Got ${status} — expected 403`);
    }
  } else {
    fail('W4: WRITER PATCH /status PUBLISHED', 'skipped — no draft id');
  }

  // W5: WRITER CANNOT edit another author's draft
  if (adminDraft) {
    const { status } = await apiCall('PUT', `/api/articles/${adminDraft.id}`, writerCookie, {
      title: 'Hijacked Article ' + testNonce,
      summary: 'Writer attempting to edit another author article which must be strictly blocked by role enforcement in the venture atlas content management platform.',
      body: 'Hijacked body content with more than twenty characters for validation.',
      categoryId,
      status: 'DRAFT',
    });
    if (status === 403) {
      const row = await getDbRow('articles', adminDraft.id);
      if (row?.author_id === ADMIN_ID) {
        pass('W5: WRITER PUT another author\'s draft → 403, DB row author_id unchanged');
      } else {
        fail('W5: WRITER PUT another author\'s draft', `author_id changed to: ${row?.author_id}`);
      }
    } else {
      fail('W5: WRITER PUT another author\'s draft', `Got ${status}`);
    }
  } else {
    fail('W5: WRITER PUT another author\'s draft', 'No ephemeral admin draft found');
  }

  // W6: WRITER CANNOT DELETE any article
  if (adminPublished) {
    const { status } = await apiCall('DELETE', `/api/articles/${adminPublished.id}`, writerCookie);
    if (status === 403) {
      const row = await getDbRow('articles', adminPublished.id);
      if (row) {
        pass('W6: WRITER DELETE article → 403, DB row still exists');
      } else {
        fail('W6: WRITER DELETE article', 'Row was DELETED despite 403');
      }
    } else {
      fail('W6: WRITER DELETE article', `Got ${status}`);
    }
  } else {
    fail('W6: WRITER DELETE article', 'No ephemeral published article found');
  }

  // W7: WRITER CANNOT reach /api/admin/users
  {
    const { status } = await apiCall('GET', '/api/admin/users', writerCookie);
    if (status === 403) {
      pass('W7: WRITER GET /api/admin/users → 403');
    } else {
      fail('W7: WRITER GET /api/admin/users', `Got ${status}`);
    }
  }

  // W8: WRITER CANNOT update own profiles.role to ADMIN
  {
    // Check API guard
    const { status } = await apiCall('PUT', '/api/admin/users', writerCookie, {
      userId: WRITER_ID,
      role: 'ADMIN',
    });
    if (status === 403) {
      pass('W8: WRITER PUT profiles.role=ADMIN via API → 403 (API guard)');
    } else {
      fail('W8: WRITER PUT profiles.role=ADMIN via API', `Got ${status}`);
    }

    // Check DB Trigger directly using writer's authenticated client!
    const { error: triggerErr } = await writerClient
      .from('profiles')
      .update({ role: 'ADMIN' })
      .eq('id', WRITER_ID);

    const row = await getDbRow('profiles', WRITER_ID);
    if (triggerErr && row?.role === 'WRITER') {
      pass('W8b: DB trigger blocked authenticated WRITER from self-role elevation');
    } else if (row?.role === 'WRITER') {
      pass('W8b: DB: WRITER profiles.role remained WRITER (RLS/trigger prevented change)');
    } else {
      fail('W8b: DB: WRITER profiles.role', `Trigger failed! Role is now: ${row?.role}`);
    }
  }

  // ================================================================
  // SECTION E: EDITOR assertions
  // ================================================================
  console.log('\n--- EDITOR ---');

  // E1: EDITOR can publish a DRAFT article
  let editorPublishedId: string | null = null;
  if (adminDraft) {
    const { status, json } = await apiCall('PATCH', `/api/articles/${adminDraft.id}/status`, editorCookie, { status: 'PUBLISHED' });
    if (status === 200) {
      const row = await getDbRow('articles', adminDraft.id);
      if (row?.status === 'PUBLISHED') {
        editorPublishedId = adminDraft.id;
        pass('E1: EDITOR PATCH /status PUBLISHED → 200, DB row = PUBLISHED');
      } else {
        fail('E1: EDITOR PATCH /status PUBLISHED', `DB status: ${row?.status}`);
      }
    } else {
      fail('E1: EDITOR PATCH /status PUBLISHED', `status=${status}, body=${JSON.stringify(json)}`);
    }
  } else {
    fail('E1: EDITOR PATCH /status PUBLISHED', 'No ephemeral admin draft found');
  }

  // E2: EDITOR can unpublish (set back to DRAFT)
  if (editorPublishedId) {
    const { status } = await apiCall('PATCH', `/api/articles/${editorPublishedId}/status`, editorCookie, { status: 'DRAFT' });
    if (status === 200) {
      const row = await getDbRow('articles', editorPublishedId);
      if (row?.status === 'DRAFT') {
        pass('E2: EDITOR PATCH /status DRAFT (unpublish) → 200, DB = DRAFT');
      } else {
        fail('E2: EDITOR PATCH /status DRAFT', `DB status: ${row?.status}`);
      }
    } else {
      fail('E2: EDITOR PATCH /status DRAFT', `Got ${status}`);
    }
  } else {
    fail('E2: EDITOR unpublish', 'skipped — E1 failed');
  }

  // E3: EDITOR can edit any article (uses ephemeral published article)
  if (adminPublished) {
    const { status } = await apiCall('PUT', `/api/articles/${adminPublished.id}`, editorCookie, {
      title: 'Ephemeral Admin Published (editor-edited) ' + testNonce,
      summary: 'This is an editor edited sixty-word summary testing that editors can modify any article regardless of author within the venture atlas content management system.',
      body: 'Editor edited body content with more than twenty characters for validation.',
      categoryId,
      status: 'PUBLISHED',
      seoTitle: 'Ephemeral Test SEO Title ' + testNonce,
      seoDescription: 'Ephemeral Test SEO Description for role verification.',
    });
    if (status === 200) {
      pass('E3: EDITOR PUT any article → 200');
    } else {
      fail('E3: EDITOR PUT any article', `Got ${status}`);
    }
  } else {
    fail('E3: EDITOR PUT any article', 'No ephemeral published article found');
  }

  // E4: EDITOR CANNOT reach /api/admin/users
  {
    const { status } = await apiCall('GET', '/api/admin/users', editorCookie);
    if (status === 403) {
      pass('E4: EDITOR GET /api/admin/users → 403');
    } else {
      fail('E4: EDITOR GET /api/admin/users', `Got ${status}`);
    }
  }

  // E5: EDITOR CANNOT change a user's role
  {
    const { status } = await apiCall('PUT', '/api/admin/users', editorCookie, {
      id: WRITER_ID,
      role: 'EDITOR',
    });
    if (status === 403) {
      const row = await getDbRow('profiles', WRITER_ID);
      if (row?.role === 'WRITER') {
        pass('E5: EDITOR PUT /api/admin/users (role change) → 403, DB unchanged');
      } else {
        fail('E5: EDITOR PUT /api/admin/users (role change)', `role changed to: ${row?.role}`);
      }
    } else {
      fail('E5: EDITOR PUT /api/admin/users (role change)', `Got ${status}`);
    }

    // Direct DB attempt by authenticated editor
    const { error: triggerErr } = await editorClient
      .from('profiles')
      .update({ role: 'ADMIN' })
      .eq('id', WRITER_ID);

    const rowAfter = await getDbRow('profiles', WRITER_ID);
    if (triggerErr && rowAfter?.role === 'WRITER') {
      pass('E5b: DB trigger blocked authenticated EDITOR from changing roles');
    } else if (rowAfter?.role === 'WRITER') {
      pass('E5b: DB: role remained WRITER (RLS/trigger prevented change)');
    } else {
      fail('E5b: DB trigger failed on EDITOR role change', `role is now: ${rowAfter?.role}`);
    }
  }

  // ================================================================
  // SECTION A: ADMIN assertions
  // ================================================================
  console.log('\n--- ADMIN ---');

  // A1: ADMIN can read /api/admin/users
  {
    const { status, json } = await apiCall('GET', '/api/admin/users', adminCookie);
    if (status === 200 && Array.isArray(json.users)) {
      pass(`A1: ADMIN GET /api/admin/users → 200, ${json.users.length} users returned`);
    } else {
      fail('A1: ADMIN GET /api/admin/users', `status=${status}, body=${JSON.stringify(json).slice(0, 100)}`);
    }
  }

  // A2: ADMIN can create a new staff user via /api/admin/users
  let newUserId: string | null = null;
  {
    const { status, json } = await apiCall('POST', '/api/admin/users', adminCookie, {
      email: `temp.staff.${testNonce}@ventureatlas.in`,
      name: 'Temp Staff',
      role: 'WRITER',
      password: 'TempStaff-Secure-2026!',
    });
    if (status === 201 && json.user?.id) {
      newUserId = json.user.id;
      ephemeralUserIds.push(newUserId!);
      const row = await getDbRow('profiles', newUserId!);
      if (row?.role === 'WRITER') {
        pass('A2: ADMIN POST /api/admin/users → 201, DB profile created with WRITER role');
      } else {
        fail('A2: ADMIN POST /api/admin/users', `DB role: ${row?.role}`);
      }
    } else {
      fail('A2: ADMIN POST /api/admin/users', `status=${status}, body=${JSON.stringify(json).slice(0, 200)}`);
    }
  }

  // A3: ADMIN can publish an article (operates on ephemeral draft)
  if (adminDraftToPublish) {
    const { status } = await apiCall('PATCH', `/api/articles/${adminDraftToPublish.id}/status`, adminCookie, { status: 'PUBLISHED' });
    if (status === 200) {
      const row = await getDbRow('articles', adminDraftToPublish.id);
      if (row?.status === 'PUBLISHED') {
        pass('A3: ADMIN PATCH /status PUBLISHED → 200, DB = PUBLISHED');
      } else {
        fail('A3: ADMIN PATCH /status PUBLISHED', `DB: ${row?.status}`);
      }
    } else {
      fail('A3: ADMIN PATCH /status PUBLISHED', `Got ${status}`);
    }
  } else {
    fail('A3: ADMIN PATCH /status PUBLISHED', 'No ephemeral draft to publish');
  }

  // A4: ADMIN CANNOT update own profiles.role (application + trigger guard)
  {
    const { status } = await apiCall('PUT', '/api/admin/users', adminCookie, {
      id: ADMIN_ID,
      role: 'WRITER', // try to demote self
    });
    if (status === 403) {
      const row = await getDbRow('profiles', ADMIN_ID);
      if (row?.role === 'ADMIN') {
        pass('A4: ADMIN cannot change own role via API → 403, DB role still ADMIN');
      } else {
        fail('A4: ADMIN self role change', `DB role changed to: ${row?.role}`);
      }
    } else {
      fail('A4: ADMIN self role change', `Got ${status}`);
    }
  }

  // A5: ADMIN can delete temp user created in A2
  if (newUserId) {
    const { status } = await apiCall('DELETE', `/api/admin/users?id=${newUserId}`, adminCookie);
    if (status === 200 || status === 204) {
      pass('A5: ADMIN DELETE temp user → success');
    } else {
      fail('A5: ADMIN DELETE temp user', `Got ${status}`);
    }
  } else {
    fail('A5: ADMIN DELETE temp user', 'skipped — A2 failed');
  }

  // Clean up writer draft if it exists
  if (writerDraftId) {
    await serviceDb.from('articles').delete().eq('id', writerDraftId);
  }

  // ================================================================
  // SECTION CM: COMMENT MODERATION (WRITER blocked, EDITOR approved, Public visibility)
  // ================================================================
  console.log('\n--- COMMENT MODERATION RBAC ---');
  let testCommentId: string | null = null;
  const testArticleId = adminPublished?.id;

  try {
    if (testArticleId) {
      // Create initial PENDING comment on ephemeral published article
      const { data: insertedComment } = await serviceDb
        .from('comments')
        .insert({
          entity_id: testArticleId,
          entity_type: 'ARTICLE',
          user_name: 'Test Reader',
          user_email: 'test.reader@ventureatlas.in',
          body: 'This is a test comment pending approval.',
          status: 'PENDING',
        })
        .select()
        .single();

      testCommentId = insertedComment?.id;
      if (testCommentId) ephemeralCommentIds.push(testCommentId);

      if (testCommentId) {
        // CM1: WRITER cannot moderate comments (403)
        const { status: writerModStatus } = await apiCall(
          'PATCH',
          `/api/admin/comments/${testCommentId}`,
          writerCookie,
          { status: 'APPROVED' }
        );
        if (writerModStatus === 403) {
          pass('CM1: WRITER PATCH /api/admin/comments/[id] → 403 (cannot moderate)');
        } else {
          fail('CM1: WRITER comment moderation', `Got ${writerModStatus}, expected 403`);
        }

        // CM2: Pending comment is NOT visible on public GET /api/comments
        const { json: publicCommentsPending } = await apiCall(
          'GET',
          `/api/comments?articleId=${testArticleId}`,
          ''
        );
        const hasPendingInPublic = (publicCommentsPending?.comments || []).some(
          (c: any) => c.id === testCommentId
        );
        if (!hasPendingInPublic) {
          pass('CM2: Public GET /api/comments excludes PENDING comment');
        } else {
          fail('CM2: Public comments leak', 'PENDING comment visible on public API');
        }

        // CM3: EDITOR can approve comment (200)
        const { status: editorApproveStatus } = await apiCall(
          'PATCH',
          `/api/admin/comments/${testCommentId}`,
          editorCookie,
          { status: 'APPROVED' }
        );
        const commentRow = await getDbRow('comments', testCommentId);
        if (editorApproveStatus === 200 && commentRow?.status === 'APPROVED') {
          pass('CM3: EDITOR PATCH /api/admin/comments/[id] APPROVED → 200, DB = APPROVED');
        } else {
          fail('CM3: EDITOR comment approval', `status=${editorApproveStatus}, DB=${commentRow?.status}`);
        }

        // CM4: Approved comment IS visible on public GET /api/comments
        const { json: publicCommentsApproved } = await apiCall(
          'GET',
          `/api/comments?articleId=${testArticleId}`,
          ''
        );
        const hasApprovedInPublic = (publicCommentsApproved?.comments || []).some(
          (c: any) => c.id === testCommentId
        );
        if (hasApprovedInPublic) {
          pass('CM4: Public GET /api/comments includes APPROVED comment');
        } else {
          fail('CM4: Public comments visibility', 'APPROVED comment missing from public API');
        }
      }
    }
  } catch (err: any) {
    console.error('CM Error details:', err);
    fail('CM: Comment moderation suite error', err.message);
  }

  // ================================================================
  // SECTION M: MFA (TOTP) assertions for EDITOR & ADMIN
  // ================================================================
  console.log('\n--- MFA (TOTP) ASSURANCE GATES ---');

  // M1: Clean up any existing factors for test editor first
  const { data: existingFactors } = await serviceDb.auth.admin.mfa.listFactors({ userId: EDITOR_ID });
  for (const f of existingFactors?.factors || []) {
    await serviceDb.auth.admin.mfa.deleteFactor({ userId: EDITOR_ID, id: f.id });
  }

  // Re-sign in editor to ensure clean aal1 session with 0 factors
  const cleanEditor = await signIn(EDITOR_EMAIL, EDITOR_PW);
  editorCookie = cleanEditor.cookieHeader;
  editorClient = cleanEditor.client;

  // M1: EDITOR at aal1 with no factor is redirected to /admin/mfa/enroll
  {
    const res = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: editorCookie },
      redirect: 'manual',
    });
    const loc = res.headers.get('location') || '';
    if ((res.status === 307 || res.status === 302) && loc.includes('/admin/mfa/enroll')) {
      pass('M1: EDITOR at aal1 (no factor) → redirected to /admin/mfa/enroll');
    } else {
      fail('M1: EDITOR at aal1 (no factor)', `Got ${res.status}, location: ${loc}`);
    }
  }

  // M2: EDITOR enrolls TOTP factor and activates it
  let enrolledFactorId: string | null = null;
  let factorSecret: string | null = null;
  {
    const { data: factorData, error: enrollErr } = await editorClient.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: 'Test Editor Authenticator',
    });

    if (!enrollErr && factorData?.id && factorData?.totp?.secret) {
      enrolledFactorId = factorData.id;
      factorSecret = factorData.totp.secret;
      pass('M2: EDITOR enrolled TOTP factor via Supabase Auth API');
    } else {
      fail('M2: EDITOR enroll TOTP factor', `Error: ${enrollErr?.message}`);
    }
  }

  // M3: EDITOR verifies enrollment challenge and upgrades session to aal2
  let aal2CookieHeader: string | null = null;
  if (enrolledFactorId && factorSecret) {
    const totpCode = generateTOTP(factorSecret);
    const { data: verifyData, error: verifyErr } = await editorClient.auth.mfa.challengeAndVerify({
      factorId: enrolledFactorId,
      code: totpCode,
    });

    if (!verifyErr && verifyData) {
      pass('M3: EDITOR verified TOTP enrollment challenge → session upgraded to aal2');
      const sessionRes = await editorClient.auth.getSession();
      const session = sessionRes.data.session;
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
        aal2CookieHeader = `sb-${projectRef}-auth-token=base64-${b64}`;
      }
    } else {
      fail('M3: EDITOR verify TOTP enrollment challenge', `Error: ${verifyErr?.message}`);
    }
  } else {
    fail('M3: EDITOR verify TOTP enrollment challenge', 'skipped — M2 failed');
  }

  // M4: EDITOR at aal2 reaches /admin (200 OK)
  if (aal2CookieHeader) {
    const res = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: aal2CookieHeader },
      redirect: 'manual',
    });
    if (res.status === 200) {
      pass('M4: EDITOR at aal2 → reaches /admin (200 OK)');
    } else {
      fail('M4: EDITOR at aal2', `Got ${res.status} (expected 200)`);
    }
  } else {
    fail('M4: EDITOR at aal2', 'skipped — M3 failed');
  }

  // M5: EDITOR signs in again with password (fresh session at aal1 with active factor) → redirected to /admin/mfa/challenge
  {
    const freshSignIn = await signIn(EDITOR_EMAIL, EDITOR_PW);
    const res = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: freshSignIn.cookieHeader },
      redirect: 'manual',
    });
    const loc = res.headers.get('location') || '';
    if ((res.status === 307 || res.status === 302) && loc.includes('/admin/mfa/challenge')) {
      pass('M5: Returning EDITOR at aal1 with active factor → redirected to /admin/mfa/challenge');
    } else {
      fail('M5: Returning EDITOR at aal1 with active factor', `Got ${res.status}, location: ${loc}`);
    }
  }

  // M6: ADMIN resets EDITOR MFA factor via /api/admin/mfa/reset
  {
    const freshAdmin = await signIn(ADMIN_EMAIL, ADMIN_PW);
    const { status, json } = await apiCall('POST', '/api/admin/mfa/reset', freshAdmin.cookieHeader, {
      targetUserId: EDITOR_ID,
    });
    if (status === 200 && json.success) {
      pass('M6: ADMIN POST /api/admin/mfa/reset → 200, factors removed');
    } else {
      fail('M6: ADMIN POST /api/admin/mfa/reset', `status=${status}, body=${JSON.stringify(json)}`);
    }
  }

  // M7: Verify MFA_RESET audit log in database
  {
    const { data: auditRow } = await serviceDb
      .from('audit_logs')
      .select('*')
      .eq('action', 'MFA_RESET')
      .eq('entity_id', EDITOR_ID)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (auditRow && auditRow.actor_email === ADMIN_EMAIL) {
      pass('M7: DB audit log confirmed MFA_RESET record created by ADMIN');
    } else {
      fail('M7: DB audit log MFA_RESET', `Audit log row: ${JSON.stringify(auditRow)}`);
    }
  }

  // ================================================================
  // Summary
  // ================================================================
  console.log('\n====================================================');
  console.log(`TOTAL: ${passed + failed} | PASSED: ${passed} | FAILED: ${failed}`);
  if (failures.length > 0) {
    console.error('\nFAILED:');
    failures.forEach(f => console.error(`  • ${f}`));
  }
  console.log('====================================================\n');

  } finally {
    console.log('--- STRICT TEARDOWN & STATE INTEGRITY VERIFICATION ---');
    await cleanupEphemeralFixtures();
    console.log('All ephemeral articles, comments, and temp auth users deleted.\n');

    // Verify database state against snapshot
    const { data: currentArticles } = await serviceDb.from('articles').select('id, slug, title, status, summary, word_count, read_time_minutes, author_id, updated_at').order('id');
    const { data: currentBlogs } = await serviceDb.from('blog_posts').select('id, slug, title, status, author_id, updated_at').order('id');
    const { data: currentCases } = await serviceDb.from('case_studies').select('id, slug, title, status, author_id, updated_at').order('id');

    const artDiff = JSON.stringify(initialArticles) !== JSON.stringify(currentArticles);
    const blogDiff = JSON.stringify(initialBlogs) !== JSON.stringify(currentBlogs);
    const caseDiff = JSON.stringify(initialCases) !== JSON.stringify(currentCases);

    if (artDiff || blogDiff || caseDiff) {
      console.error('ERROR: Database content differed from snapshot!');
      if (artDiff) {
        console.error('Articles Diff: initial count =', initialArticles?.length, 'current count =', currentArticles?.length);
        console.error('Initial:', JSON.stringify(initialArticles));
        console.error('Current:', JSON.stringify(currentArticles));
      }
      if (blogDiff) console.error('Blog Diff:', initialBlogs, currentBlogs);
      if (caseDiff) console.error('Case Diff:', initialCases, currentCases);
    } else {
      console.log('✓ VERIFIED: Database state is 100% byte-identical before and after test run.\n');
    }
  }

  if (failed > 0) process.exit(1);
}

run().catch(e => { console.error('Test runner crashed:', e); process.exit(1); });

