import { createClient } from '@supabase/supabase-js';

export {};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function main() {
  const supabase = createClient(supabaseUrl, serviceKey);

  console.log('=== DATABASE ROW COUNTS AUDIT ===\n');

  const tables = ['articles', 'blog_posts', 'case_studies', 'categories', 'view_events', 'newsletter_subscribers', 'profiles'];

  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('id', { count: 'exact', head: true });
    console.log(`Table "${t}": ${count ?? 'Error'} rows ${error ? '(' + error.message + ')' : ''}`);
  }

  // Check breakdown of articles by status
  console.log('\n--- ARTICLES STATUS BREAKDOWN ---');
  const { data: arts } = await supabase.from('articles').select('id, title, slug, status, author_id');
  const statusCounts = (arts || []).reduce((acc: any, a) => {
    acc[a.status] = (acc[a.status] || 0) + 1;
    return acc;
  }, {});
  console.log('Status counts:', JSON.stringify(statusCounts, null, 2));

  console.log('\nAll article slugs & status:');
  for (const a of arts || []) {
    console.log(`  • [${a.status.padEnd(9)}] ${a.slug} (${a.title.slice(0, 40)})`);
  }
}

main().catch(console.error);
