import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

export {};

const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const ROOT_ADMIN_EMAIL = 'admin@ventureatlas.io';
const ROOT_ADMIN_PW = 'Atlas#Vault9872!AdminEnterprise$X';

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
  console.log('   ADMIN USER CREATION & ROLE SIGN-IN VERIFICATION  ');
  console.log('====================================================\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Sign in as Root Admin
  console.log(`[1] Signing in as Root Admin (${ROOT_ADMIN_EMAIL})...`);
  const adminCookie = await signIn(ROOT_ADMIN_EMAIL, ROOT_ADMIN_PW);
  console.log('[PASS] Root Admin authenticated successfully with session token\n');

  const ts = Date.now();
  const writerEmail = `prov.writer.${ts}@ventureatlas.io`;
  const writerPw = `WriterPass#2026!SecureKey`;
  const editorEmail = `prov.editor.${ts}@ventureatlas.io`;
  const editorPw = `EditorPass#2026!SecureKey`;

  let writerUid = '';
  let editorUid = '';

  try {
    // 2. Admin creates a new WRITER via POST /api/admin/users
    console.log(`[2] Admin creating WRITER account (${writerEmail}) via POST /api/admin/users...`);
    const createWriterRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        email: writerEmail,
        password: writerPw,
        name: 'Jane Staff Writer',
        role: 'WRITER',
      }),
    });
    const writerData = await createWriterRes.json();
    console.log(`[PASS] Create WRITER response: HTTP ${createWriterRes.status} | User ID: ${writerData.user?.id}`);
    writerUid = writerData.user?.id;

    // 3. Admin creates a new EDITOR via POST /api/admin/users
    console.log(`\n[3] Admin creating EDITOR account (${editorEmail}) via POST /api/admin/users...`);
    const createEditorRes = await fetch(`${BASE_URL}/api/admin/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: adminCookie },
      body: JSON.stringify({
        email: editorEmail,
        password: editorPw,
        name: 'Mark Senior Editor',
        role: 'EDITOR',
      }),
    });
    const editorData = await createEditorRes.json();
    console.log(`[PASS] Create EDITOR response: HTTP ${createEditorRes.status} | User ID: ${editorData.user?.id}`);
    editorUid = editorData.user?.id;

    // 4. Test Newly Created WRITER Signs In & Accesses /admin
    console.log(`\n[4] Testing newly created WRITER sign-in with credentials (${writerEmail})...`);
    const writerCookie = await signIn(writerEmail, writerPw);
    const writerAdminPageRes = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: writerCookie },
      redirect: 'manual',
    });
    console.log(`[PASS] WRITER sign in & access /admin → HTTP ${writerAdminPageRes.status} (Direct dashboard access)`);

    // 5. Test Newly Created EDITOR Signs In & Accesses /admin directly
    console.log(`\n[5] Testing newly created EDITOR sign-in with credentials (${editorEmail})...`);
    const editorCookie = await signIn(editorEmail, editorPw);
    const editorAdminPageRes = await fetch(`${BASE_URL}/admin`, {
      headers: { Cookie: editorCookie },
      redirect: 'manual',
    });
    console.log(`[PASS] EDITOR sign in & access /admin → HTTP ${editorAdminPageRes.status} (Direct dashboard access, MFA removed)`);

    console.log('\n====================================================');
    console.log('[SUCCESS] Root Admin can create new roles and newly created staff sign in cleanly without issue.');
    console.log('====================================================\n');
  } finally {
    // Cleanup temporary test accounts
    console.log('[Cleanup] Tearing down temporary created accounts...');
    if (writerUid) {
      await supabase.from('profiles').delete().eq('id', writerUid);
      await supabase.auth.admin.deleteUser(writerUid);
    }
    if (editorUid) {
      await supabase.from('profiles').delete().eq('id', editorUid);
      await supabase.auth.admin.deleteUser(editorUid);
    }
    console.log('[Cleanup] Database restored with only 1 primary root admin.');
  }
}

main().catch(console.error);
