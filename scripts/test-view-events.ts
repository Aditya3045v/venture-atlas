import { createClient } from '@supabase/supabase-js';

const BASE_URL = 'http://localhost:3000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function main() {
  console.log('=== B17: VIEW_EVENTS ROW COUNT PROOF ===\n');

  const supabase = createClient(supabaseUrl, serviceKey);

  // 1. Get initial row count of view_events
  const { count: countBefore, error: countErr1 } = await supabase
    .from('view_events')
    .select('id', { count: 'exact', head: true });

  console.log(`[BEFORE] view_events row count in Supabase: ${countBefore ?? 0}`);

  // 2. Fetch 3 published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('id, slug, title')
    .eq('status', 'PUBLISHED')
    .limit(3);

  if (!articles || articles.length < 3) {
    console.error('Not enough published articles found for test');
    process.exit(1);
  }

  console.log(`\nSimulating 3 article page views via /api/views:`);
  for (const art of articles) {
    const res = await fetch(`${BASE_URL}/api/views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'Referer': 'https://ventureatlas.io/search',
      },
      body: JSON.stringify({
        articleId: art.id,
        path: `/articles/${art.slug}`,
        referrer: 'https://ventureatlas.io/search',
      }),
    });

    const json = await res.json().catch(() => ({}));
    console.log(`  • Viewed "${art.title.slice(0, 35)}..." → HTTP ${res.status} ${JSON.stringify(json)}`);
  }

  // 3. Get row count of view_events after
  const { count: countAfter, error: countErr2 } = await supabase
    .from('view_events')
    .select('id', { count: 'exact', head: true });

  console.log(`\n[AFTER] view_events row count in Supabase: ${countAfter ?? 0}`);
  console.log(`[NET NEW ROWS WRITTEN]: ${(countAfter ?? 0) - (countBefore ?? 0)}`);

  // 4. Fetch the last 3 view_events rows to show data integrity
  const { data: recentEvents } = await supabase
    .from('view_events')
    .select('id, article_id, path, referrer, user_agent, created_at')
    .order('created_at', { ascending: false })
    .limit(3);

  console.log('\n--- RECENT VIEW_EVENTS ROWS ---');
  console.log(JSON.stringify(recentEvents, null, 2));
}

main().catch(console.error);
