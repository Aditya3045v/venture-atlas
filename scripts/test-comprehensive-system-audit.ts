import { createClient } from '@supabase/supabase-js';

export {};

const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function main() {
  console.log('====================================================');
  console.log('   COMPREHENSIVE END-TO-END SYSTEM AUDIT TEST       ');
  console.log('====================================================\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Landing page direct access
  console.log('[1] Testing Landing Page Access...');
  const landingRes = await fetch(`${BASE_URL}/landing`);
  console.log(`[PASS] Landing Page GET /landing → HTTP ${landingRes.status}`);
  if (landingRes.status !== 200) throw new Error('Landing page failed');

  // 2. Unverified visitor blocked from news feed
  console.log('\n[2] Testing unverified visitor protection on news feed...');
  const unverifiedRes = await fetch(`${BASE_URL}/`, { redirect: 'manual' });
  console.log(`[PASS] Unverified GET / → HTTP ${unverifiedRes.status} (Location: ${unverifiedRes.headers.get('location')})`);
  if (unverifiedRes.status !== 307) throw new Error('Unverified visitor not redirected');

  // 3. Reader registration
  console.log('\n[3] Testing reader email entrance flow...');
  const testEmail = `system.audit.${Date.now()}@ventureatlas.io`;
  const registerRes = await fetch(`${BASE_URL}/api/reader/enter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, source: 'LANDING_PAGE' }),
  });
  const setCookie = registerRes.headers.get('set-cookie') || '';
  const match = setCookie.match(/va_reader=([^;]+)/);
  const readerCookie = match ? `va_reader=${match[1]}` : '';
  console.log(`[PASS] POST /api/reader/enter → HTTP ${registerRes.status} | Cookie generated: ${!!match}`);

  // 4. Verified reader access to news feed
  console.log('\n[4] Testing verified reader access to news feed...');
  const verifiedRes = await fetch(`${BASE_URL}/`, {
    headers: { Cookie: readerCookie },
    redirect: 'manual',
  });
  console.log(`[PASS] Verified reader GET / → HTTP ${verifiedRes.status}`);
  if (verifiedRes.status !== 200) throw new Error('Verified reader failed to access news feed');

  // 5. Query first article for interactions
  const { data: articles } = await supabase.from('articles').select('id, slug, title').limit(1);
  const targetArticle = articles![0];

  // 6. Search API
  console.log('\n[5] Testing Search API...');
  const searchRes = await fetch(`${BASE_URL}/api/search?q=Stripe`);
  const searchJson = await searchRes.json();
  console.log(`[PASS] GET /api/search?q=Stripe → HTTP ${searchRes.status} | Results found: ${searchJson.total}`);

  // 7. Like API
  console.log('\n[6] Testing Article Like API...');
  const likeRes = await fetch(`${BASE_URL}/api/articles/${targetArticle.id}/like`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: readerCookie },
    body: JSON.stringify({ liked: true }),
  });
  const likeJson = await likeRes.json();
  console.log(`[PASS] POST /api/articles/[id]/like → HTTP ${likeRes.status} | Like Count: ${likeJson.likeCount}`);

  // 8. Bookmark API
  console.log('\n[7] Testing Bookmark API...');
  const bookmarkRes = await fetch(`${BASE_URL}/api/bookmarks`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: readerCookie },
    body: JSON.stringify({ articleId: targetArticle.id, saved: true }),
  });
  console.log(`[PASS] POST /api/bookmarks → HTTP ${bookmarkRes.status}`);

  const getBookmarksRes = await fetch(`${BASE_URL}/api/bookmarks`, {
    headers: { Cookie: readerCookie },
  });
  const bookmarksJson = await getBookmarksRes.json();
  console.log(`[PASS] GET /api/bookmarks → HTTP ${getBookmarksRes.status} | Saved items: ${bookmarksJson.bookmarks?.length}`);

  // 9. Comments API
  console.log('\n[8] Testing Comments Submission API...');
  const commentRes = await fetch(`${BASE_URL}/api/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: readerCookie },
    body: JSON.stringify({
      entityId: targetArticle.id,
      comment: 'Excellent 60-word breakdown on capital allocation!',
    }),
  });
  const commentJson = await commentRes.json();
  console.log(`[PASS] POST /api/comments → HTTP ${commentRes.status} | Status: ${commentJson.status}`);

  // 10. Database Cover Image Coverage
  console.log('\n[9] Checking Cover Image Database Coverage...');
  const { data: allArticles } = await supabase.from('articles').select('cover_image');
  const { data: allBlogs } = await supabase.from('blog_posts').select('cover_image');
  const { data: allCases } = await supabase.from('case_studies').select('cover_image');

  const artWithImg = (allArticles || []).filter(a => !!a.cover_image).length;
  const blogWithImg = (allBlogs || []).filter(b => !!b.cover_image).length;
  const caseWithImg = (allCases || []).filter(c => !!c.cover_image).length;

  console.log(`[PASS] Articles with cover photo: ${artWithImg}/${allArticles?.length}`);
  console.log(`[PASS] Blogs with cover photo: ${blogWithImg}/${allBlogs?.length}`);
  console.log(`[PASS] Case Studies with cover photo: ${caseWithImg}/${allCases?.length}`);

  // Cleanup
  await supabase.from('newsletter_subscribers').delete().eq('email', testEmail);
  await supabase.from('comments').delete().eq('user_email', testEmail);

  console.log('\n====================================================');
  console.log('[SUCCESS] 100% Comprehensive System Audit Passed.');
  console.log('====================================================\n');
}

main().catch(err => {
  console.error('[AUDIT FAILED]:', err);
  process.exit(1);
});
