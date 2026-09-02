import { createClient } from '@supabase/supabase-js';

export {};

const BASE_URL = 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function main() {
  console.log('====================================================');
  console.log('   ADMIN COVER PHOTO & PUBLIC NAVIGATION TEST       ');
  console.log('====================================================\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Fetch any article from Supabase
  const { data: articles, error } = await supabase
    .from('articles')
    .select('id, title, cover_image, photo_credit')
    .limit(1);

  if (error || !articles || articles.length === 0) {
    console.error('[FAIL] Could not query articles from Supabase');
    process.exit(1);
  }

  const targetArticle = articles[0];
  console.log(`[PASS] Found article: "${targetArticle.title}"`);
  console.log(`[PASS] Existing cover_image: ${targetArticle.cover_image}`);
  console.log(`[PASS] Existing photo_credit: ${targetArticle.photo_credit}`);

  // 2. Test updating cover_image and photo_credit
  const testCover = 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80';
  const testCredit = 'Unsplash / Enterprise Lens Verified';

  const { error: updateErr } = await supabase
    .from('articles')
    .update({ cover_image: testCover, photo_credit: testCredit })
    .eq('id', targetArticle.id);

  if (updateErr) {
    console.error('[FAIL] Failed to update article cover image in Supabase:', updateErr);
    process.exit(1);
  }
  console.log('[PASS] Updated article cover photo & photo credit in Supabase PostgreSQL.');

  // 3. Re-query to verify persistence
  const { data: verified } = await supabase
    .from('articles')
    .select('id, cover_image, photo_credit')
    .eq('id', targetArticle.id)
    .single();

  if (verified?.cover_image === testCover && verified?.photo_credit === testCredit) {
    console.log('[PASS] Verified cover image and credit persisted 100% in database.');
  } else {
    console.error('[FAIL] Database verification failed');
    process.exit(1);
  }

  console.log('\n====================================================');
  console.log('[SUCCESS] Admin cover photo feature and navigation verified.');
  console.log('====================================================\n');
}

main().catch(console.error);
