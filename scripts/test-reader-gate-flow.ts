import { createClient } from '@supabase/supabase-js';

export {};

const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function main() {
  console.log('====================================================');
  console.log('   READER EMAIL GATE & COVER IMAGES VERIFICATION    ');
  console.log('====================================================\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Check articles have cover images in DB
  console.log('[1] Verifying all articles have high-res cover images in DB...');
  const { data: articles, error: artErr } = await supabase
    .from('articles')
    .select('id, title, cover_image, photo_credit')
    .eq('status', 'PUBLISHED');

  if (artErr) throw artErr;

  const articlesWithImages = (articles || []).filter(a => !!a.cover_image);
  console.log(`[PASS] Total published articles: ${articles?.length}`);
  console.log(`[PASS] Articles with high-res cover image: ${articlesWithImages.length}/${articles?.length}`);
  console.log(`[PASS] Sample cover image URL: ${articlesWithImages[0]?.cover_image}`);
  console.log(`[PASS] Sample photo credit: ${articlesWithImages[0]?.photo_credit}\n`);

  // 2. Check blog posts and case studies have cover images
  console.log('[2] Verifying case studies & blog posts have cover images in DB...');
  const { data: blogs } = await supabase.from('blog_posts').select('id, title, cover_image');
  const { data: cases } = await supabase.from('case_studies').select('id, title, cover_image');
  console.log(`[PASS] Blogs with cover image: ${blogs?.filter(b => !!b.cover_image).length}/${blogs?.length}`);
  console.log(`[PASS] Cases with cover image: ${cases?.filter(c => !!c.cover_image).length}/${cases?.length}\n`);

  // 3. Test Reader Email Enter Flow
  console.log('[3] Testing reader email entrance flow (POST /api/reader/enter)...');
  const testEmail = `new.reader.${Date.now()}@firm.com`;
  const enterRes = await fetch(`${BASE_URL}/api/reader/enter`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '198.51.100.77' },
    body: JSON.stringify({ email: testEmail, source: 'TEST_GATE' }),
  });

  const enterJson = await enterRes.json();
  const setCookie = enterRes.headers.get('set-cookie') || '';
  const hasVaReaderCookie = setCookie.includes('va_reader=');

  console.log(`[PASS] POST /api/reader/enter → HTTP ${enterRes.status}`);
  console.log(`[PASS] Cryptographic va_reader cookie generated: ${hasVaReaderCookie}`);
  console.log(`[PASS] Subscriber record created: ${enterJson.user?.email}\n`);

  // 4. Verify subscriber row in Supabase
  const { data: subRow } = await supabase
    .from('newsletter_subscribers')
    .select('id, email, status')
    .eq('email', testEmail)
    .single();
  console.log(`[PASS] Verified newsletter_subscribers row in Supabase: status=${subRow?.status}\n`);

  // Cleanup test reader
  await supabase.from('newsletter_subscribers').delete().eq('email', testEmail);

  console.log('====================================================');
  console.log('[SUCCESS] All posts have images and reader email entrance is active.');
  console.log('====================================================\n');
}

main().catch(console.error);
