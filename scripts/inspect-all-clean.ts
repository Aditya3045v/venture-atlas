import { supabaseAdmin } from '../src/lib/supabase/admin';

async function main() {
  const { data: articles, error: e1 } = await supabaseAdmin
    .from('articles')
    .select('id, slug, title, status, author_id, updated_at, published_at, word_count, summary')
    .order('created_at', { ascending: false });
  if (e1) console.error('Articles error:', e1);

  const { data: blogs, error: e2 } = await supabaseAdmin
    .from('blog_posts')
    .select('id, slug, title, status, author_id, updated_at, published_at')
    .order('created_at', { ascending: false });
  if (e2) console.error('Blogs error:', e2);

  const { data: cases, error: e3 } = await supabaseAdmin
    .from('case_studies')
    .select('id, slug, title, status, author_id, updated_at, published_at, company')
    .order('created_at', { ascending: false });
  if (e3) console.error('Case studies error:', e3);

  const { data: profiles, error: e4 } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name, role');
  if (e4) console.error('Profiles error:', e4);

  console.log('=== REAL PROFILES IN DB ===');
  console.log(JSON.stringify(profiles, null, 2));

  console.log('\n=== REAL ARTICLES IN DB (' + (articles?.length || 0) + ' rows) ===');
  console.log(JSON.stringify(articles, null, 2));

  console.log('\n=== REAL BLOG POSTS IN DB (' + (blogs?.length || 0) + ' rows) ===');
  console.log(JSON.stringify(blogs, null, 2));

  console.log('\n=== REAL CASE STUDIES IN DB (' + (cases?.length || 0) + ' rows) ===');
  console.log(JSON.stringify(cases, null, 2));
}

main().catch(console.error);
