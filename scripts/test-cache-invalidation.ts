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
  console.log('       CACHE TAGGING & REVALIDATION PROOF TEST       ');
  console.log('====================================================\n');

  const supabase = createClient(supabaseUrl, serviceKey);

  const ORIGINAL_TITLE = 'Stripe Closes $6.5B Round at $65B Valuation, Eyes 2027 IPO';
  const UPDATED_TITLE = `Stripe Closes $6.5B Round at $65B Valuation [Revalidated ${Date.now()}]`;

  // 1. Ensure DB has the original title
  const { data: stripeArt, error: findErr } = await supabase
    .from('articles')
    .select('id, title, slug, summary, body, category_id')
    .eq('slug', 'stripe-6b-round-2027-ipo')
    .single();

  if (findErr || !stripeArt) {
    console.error('[FAIL] Stripe article not found in database:', findErr?.message);
    process.exit(1);
  }

  // Restore baseline
  await supabase
    .from('articles')
    .update({ title: ORIGINAL_TITLE })
    .eq('id', stripeArt.id);

  // Create ephemeral test editor
  const ts = Date.now();
  const tempEmail = `temp.editor.cache.${ts}@test.ventureatlas.io`;
  const tempPw = `TempEditorPass!${ts}`;

  const { data: userRes, error: createErr } = await supabase.auth.admin.createUser({
    email: tempEmail,
    password: tempPw,
    email_confirm: true,
  });

  if (createErr || !userRes.user) {
    console.error('[FAIL] Could not create temp editor user:', createErr?.message);
    process.exit(1);
  }

  const tempUid = userRes.user.id;
  await supabase.from('profiles').upsert({
    id: tempUid,
    email: tempEmail,
    name: 'Temp Cache Editor',
    role: 'EDITOR',
  });

  try {
    // Sign in as ephemeral EDITOR to obtain authenticated SSR session cookies
    const { cookieHeader } = await signIn(tempEmail, tempPw);

    // 2. Fetch public page at T1 and ASSERT original title is present
    const t1 = new Date();
    console.log(`[T1: ${t1.toISOString()}] Step 1: Fetching initial article page...`);
    const res1 = await fetch(`${BASE_URL}/articles/${stripeArt.slug}`);
    const html1 = await res1.text();

    const originalPresentAtT1 = html1.includes(ORIGINAL_TITLE);
    console.log(`[T1 Result] HTTP ${res1.status} | Original title present: ${originalPresentAtT1}`);

    if (!originalPresentAtT1) {
      console.error('[FAIL] ASSERTION FAILED at T1: Original title was NOT present in page HTML.');
      process.exit(1);
    }

    // 3. Edit & Republish via real API endpoint (which calls revalidateTag) at T2
    const t2 = new Date();
    console.log(`\n[T2: ${t2.toISOString()}] Step 2: Editing article title & revalidating tags via PUT /api/articles/${stripeArt.id}...`);

    const putRes = await fetch(`${BASE_URL}/api/articles/${stripeArt.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify({
        title: UPDATED_TITLE,
        summary: stripeArt.summary || 'Summary test for revalidation proof',
        body: stripeArt.body || 'Body content testing revalidation propagation.',
        categoryId: stripeArt.category_id,
        status: 'PUBLISHED',
      }),
    });

    const putJson = await putRes.json().catch(() => ({}));
    console.log(`[T2 Result] PUT API response: HTTP ${putRes.status} | Body: ${JSON.stringify(putJson)}`);

    if (putRes.status !== 200) {
      console.error('[FAIL] API PUT request failed:', putJson);
      process.exit(1);
    }

    // 4. Fetch public page at T3 and ASSERT new title present and original absent
    const t3 = new Date();
    console.log(`\n[T3: ${t3.toISOString()}] Step 3: Fetching article page without hard refresh...`);
    const res2 = await fetch(`${BASE_URL}/articles/${stripeArt.slug}`);
    const html2 = await res2.text();

    const updatedPresentAtT3 = html2.includes(UPDATED_TITLE);
    const originalAbsentAtT3 = !html2.includes(ORIGINAL_TITLE);

    console.log(`[T3 Result] HTTP ${res2.status} | Updated title present: ${updatedPresentAtT3} | Original title absent: ${originalAbsentAtT3}`);
    console.log(`[Latency] Time delta: ${t3.getTime() - t2.getTime()} ms`);

    // 5. Restore original title in database via API
    await fetch(`${BASE_URL}/api/articles/${stripeArt.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cookie': cookieHeader,
      },
      body: JSON.stringify({
        title: ORIGINAL_TITLE,
        summary: stripeArt.summary || 'Summary test for revalidation proof',
        body: stripeArt.body || 'Body content testing revalidation propagation.',
        categoryId: stripeArt.category_id,
        status: 'PUBLISHED',
      }),
    });

    console.log('\n[Cleanup] Restored original article title in database & revalidated.');

    if (updatedPresentAtT3 && originalAbsentAtT3) {
      console.log('\n====================================================');
      console.log('[SUCCESS] Cache tagging and revalidation verified:');
      console.log(`  • T1: Verified original title "${ORIGINAL_TITLE}"`);
      console.log(`  • T2: Updated to "${UPDATED_TITLE}" & revalidated`);
      console.log(`  • T3: Verified updated title present and original absent`);
      console.log('====================================================');
    } else {
      console.error('\n[FAIL] Revalidation failed: updated title not propagated or original still cached.');
      process.exit(1);
    }
  } finally {
    // Delete ephemeral test editor
    try {
      await supabase.from('profiles').delete().eq('id', tempUid);
      await supabase.auth.admin.deleteUser(tempUid);
    } catch {}
  }
}

main().catch(e => {
  console.error('[CRASH]', e);
  process.exit(1);
});
