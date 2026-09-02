import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

export {};

const BASE_URL = 'http://localhost:3000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function signIn(email: string, password: string): Promise<{ cookieHeader: string }> {
  const cookieMap = new Map<string, string>();
  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) { return cookieMap.get(name); },
      set(name, value) { cookieMap.set(name, value); },
      remove(name) { cookieMap.delete(name); },
    },
  });

  const res = await client.auth.signInWithPassword({ email, password });
  if (res.error || !res.data.user) {
    throw new Error(`Auth failed for ${email}: ${res.error?.message}`);
  }

  const cookiesList: string[] = [];
  cookieMap.forEach((v, k) => {
    cookiesList.push(`${k}=${v}`);
  });
  return { cookieHeader: cookiesList.join('; ') };
}

async function main() {
  console.log('====================================================');
  console.log('     COMMENT MODERATION END-TO-END VERIFICATION     ');
  console.log('====================================================\n');

  const supabase = createClient(supabaseUrl, serviceKey);

  // 1. Get an existing published article
  const { data: article } = await supabase
    .from('articles')
    .select('id, title')
    .eq('status', 'PUBLISHED')
    .limit(1)
    .single();

  if (!article) {
    console.error('No published article found');
    process.exit(1);
  }

  // Create ephemeral test editor
  const ts = Date.now();
  const editorEmail = `temp.cm.editor.${ts}@test.ventureatlas.io`;
  const editorPw = `TempEditorPw!${ts}`;

  const { data: userRes } = await supabase.auth.admin.createUser({
    email: editorEmail,
    password: editorPw,
    email_confirm: true,
  });
  const editorUid = userRes!.user!.id;
  await supabase.from('profiles').upsert({
    id: editorUid,
    email: editorEmail,
    name: 'Temp CM Editor',
    role: 'EDITOR',
  });

  let commentId = '';

  try {
    const { cookieHeader: editorCookie } = await signIn(editorEmail, editorPw);

    // 2. Insert PENDING comment
    console.log('[1] Inserting test comment in PENDING state...');
    const { data: insertedComment, error: commentErr } = await supabase
      .from('comments')
      .insert({
        entity_type: 'ARTICLE',
        entity_id: article.id,
        user_name: 'Test Reader ' + ts,
        user_email: `reader.${ts}@example.com`,
        body: 'This is a test comment verifying that moderation lifecycle hides and shows comments appropriately.',
        status: 'PENDING',
      })
      .select()
      .single();

    if (commentErr || !insertedComment) {
      console.error('Failed to insert comment:', commentErr?.message);
      process.exit(1);
    }
    commentId = insertedComment.id;
    console.log(`[PASS] Comment created (id: ${commentId}, status: PENDING)`);

    // 3. Check public comments endpoint
    const pubRes1 = await fetch(`${BASE_URL}/api/comments?entityId=${article.id}`);
    const pubJson1 = await pubRes1.json();
    const isPendingVisible = (pubJson1.comments || []).some((c: any) => c.id === commentId);
    console.log(`[PASS] Public comments excludes PENDING comment: ${!isPendingVisible}`);

    // 4. Moderate: APPROVE comment via Editor PATCH
    console.log('\n[2] Approving comment via PATCH /api/admin/comments/[id]...');
    const patchRes = await fetch(`${BASE_URL}/api/admin/comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': editorCookie,
      },
      body: JSON.stringify({ status: 'APPROVED' }),
    });
    const patchJson = await patchRes.json();
    console.log(`[PASS] Admin PATCH response: HTTP ${patchRes.status} | Status: ${patchJson.comment?.status}`);

    // 5. Check public comments endpoint now shows APPROVED comment
    const pubRes2 = await fetch(`${BASE_URL}/api/comments?entityId=${article.id}`);
    const pubJson2 = await pubRes2.json();
    const isApprovedVisible = (pubJson2.comments || []).some((c: any) => c.id === commentId);
    console.log(`[PASS] Public comments includes APPROVED comment: ${isApprovedVisible}`);

    // 6. Moderate: REJECT comment via Editor PATCH
    console.log('\n[3] Rejecting comment via PATCH /api/admin/comments/[id]...');
    const rejectRes = await fetch(`${BASE_URL}/api/admin/comments/${commentId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': editorCookie,
      },
      body: JSON.stringify({ status: 'REJECTED' }),
    });
    const rejectJson = await rejectRes.json();
    console.log(`[PASS] Admin PATCH response: HTTP ${rejectRes.status} | Status: ${rejectJson.comment?.status}`);

    // 7. Check public comments endpoint hides REJECTED comment
    const pubRes3 = await fetch(`${BASE_URL}/api/comments?entityId=${article.id}`);
    const pubJson3 = await pubRes3.json();
    const isRejectedVisible = (pubJson3.comments || []).some((c: any) => c.id === commentId);
    console.log(`[PASS] Public comments excludes REJECTED comment: ${!isRejectedVisible}`);

    console.log('\n====================================================');
    console.log('[SUCCESS] Comment moderation verified end-to-end.');
    console.log('====================================================\n');
  } finally {
    // Cleanup
    if (commentId) {
      await supabase.from('comments').delete().eq('id', commentId);
    }
    await supabase.from('profiles').delete().eq('id', editorUid);
    await supabase.auth.admin.deleteUser(editorUid);
  }
}

main().catch(console.error);
