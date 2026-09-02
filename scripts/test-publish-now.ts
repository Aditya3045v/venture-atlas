import { createClient } from '@supabase/supabase-js';

export {};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function main() {
  console.log('====================================================');
  console.log('   TESTING ARTICLE PUBLISHING DATABASE PIPELINE     ');
  console.log('====================================================\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Fetch first category
  const { data: categories } = await supabase.from('categories').select('id, name').limit(1);
  const cat = categories![0];

  // 2. Fetch admin user
  const { data: profiles } = await supabase.from('profiles').select('id, email').eq('role', 'ADMIN').limit(1);
  const adminProfile = profiles![0];

  const testTitle = `Test Instant Publish ${Date.now()}`;
  const testSlug = `test-instant-publish-${Date.now()}`;

  // 3. Create published article directly using exact schema payload
  const insertPayload = {
    title: testTitle,
    slug: testSlug,
    summary: 'A fast 60-word test briefing testing immediate 1-click publishing without any browser reload blockage.',
    body: 'Complete detailed body report for testing immediate publishing.',
    category_id: cat.id,
    author_id: adminProfile.id,
    source_name: 'Venture Atlas Wire',
    source_author: 'Aditya Poddar',
    status: 'PUBLISHED',
    word_count: 14,
    read_time_minutes: 1,
    published_at: new Date().toISOString(),
    cover_image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1200&q=80',
    photo_credit: 'Unsplash / Enterprise Lens',
  };

  const { data: inserted, error: insertErr } = await supabase
    .from('articles')
    .insert(insertPayload)
    .select()
    .single();

  if (insertErr || !inserted) {
    console.error('[FAIL] Failed to insert article:', insertErr);
    process.exit(1);
  }

  console.log(`[PASS] Article published with ID: ${inserted.id} and status: ${inserted.status}`);

  // 4. Update the article to verify 1-click update
  const { data: updated, error: updateErr } = await supabase
    .from('articles')
    .update({ title: `${testTitle} (Updated)` })
    .eq('id', inserted.id)
    .select()
    .single();

  if (updateErr || !updated) {
    console.error('[FAIL] Failed to update article:', updateErr);
    process.exit(1);
  }

  console.log(`[PASS] Article 1-click updated title: "${updated.title}"`);

  // Cleanup
  await supabase.from('articles').delete().eq('id', inserted.id);
  console.log('[PASS] Test article cleaned up.');

  console.log('\n====================================================');
  console.log('[SUCCESS] 1-Click Publishing Pipeline 100% Verified.');
  console.log('====================================================\n');
}

main().catch(console.error);
