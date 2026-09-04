import { supabaseAdmin } from '../src/lib/supabase/admin';

async function main() {
  const { data: articles } = await supabaseAdmin
    .from('articles')
    .select('id, slug, title, status, author_id, updated_at, published_at, word_count, read_time_minutes, summary')
    .order('created_at', { ascending: false });

  const { data: blogs } = await supabaseAdmin
    .from('blog_posts')
    .select('id, slug, title, status, author_id, updated_at, published_at, word_count, read_time_minutes')
    .order('created_at', { ascending: false });

  const { data: cases } = await supabaseAdmin
    .from('case_studies')
    .select('id, slug, title, status, author_id, updated_at, published_at, word_count, read_time_minutes, company')
    .order('created_at', { ascending: false });

  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('id, email, name, role');

  console.log('=== PROFILES IN DB ===');
  console.log(JSON.stringify(profiles, null, 2));

  console.log('\n=== ARTICLES IN DB (' + (articles?.length || 0) + ' rows) ===');
  console.log(JSON.stringify(articles, null, 2));

  console.log('\n=== BLOG POSTS IN DB (' + (blogs?.length || 0) + ' rows) ===');
  console.log(JSON.stringify(blogs, null, 2));

  console.log('\n=== CASE STUDIES IN DB (' + (cases?.length || 0) + ' rows) ===');
  console.log(JSON.stringify(cases, null, 2));
}

main().catch(console.error);
