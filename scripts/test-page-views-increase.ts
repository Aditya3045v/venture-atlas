import { createClient } from '@supabase/supabase-js';

export {};

const BASE_URL = 'http://localhost:3000';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

async function main() {
  console.log('====================================================');
  console.log('       PAGE VIEW TRACKING VERIFICATION (3C)         ');
  console.log('====================================================\n');

  const supabase = createClient(supabaseUrl, serviceKey);

  // 1. Get BEFORE count
  const { count: beforeCount, error: countErr1 } = await supabase
    .from('view_events')
    .select('id', { count: 'exact', head: true });

  if (countErr1) {
    console.error('Error fetching before count:', countErr1.message);
    process.exit(1);
  }

  console.log(`[BEFORE] view_events table count in Supabase: ${beforeCount}`);

  // Fetch 3 distinct published articles
  const { data: articles } = await supabase
    .from('articles')
    .select('id, title, slug')
    .eq('status', 'PUBLISHED')
    .limit(3);

  if (!articles || articles.length < 3) {
    console.error('Need at least 3 published articles');
    process.exit(1);
  }

  console.log('\nTriggering page view tracking for 3 direct article loads:');

  for (let i = 0; i < 3; i++) {
    const art = articles[i];
    // Direct page view event fired from page load / ViewTracker component
    const res = await fetch(`${BASE_URL}/api/views`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
        'X-Forwarded-For': `198.51.100.${10 + i}`,
      },
      body: JSON.stringify({
        articleId: art.id,
        entityType: 'ARTICLE',
        path: `/articles/${art.slug}`,
        referrer: 'https://www.google.com/',
      }),
    });

    const json = await res.json();
    console.log(`  [${i + 1}/3] Fired view for "${art.title.slice(0, 35)}..." → HTTP ${res.status} | response: ${JSON.stringify(json)}`);
  }

  // 2. Get AFTER count
  const { count: afterCount, error: countErr2 } = await supabase
    .from('view_events')
    .select('id', { count: 'exact', head: true });

  if (countErr2) {
    console.error('Error fetching after count:', countErr2.message);
    process.exit(1);
  }

  console.log(`\n[AFTER] view_events table count in Supabase: ${afterCount}`);
  const diff = (afterCount || 0) - (beforeCount || 0);
  console.log(`[NET INCREASE]: ${diff}`);

  if (diff === 3) {
    console.log('\n====================================================');
    console.log('[SUCCESS] view_events count increased by EXACTLY 3.');
    console.log('====================================================');
  } else {
    console.error(`\n[FAIL] Expected increase of 3, got ${diff}`);
    process.exit(1);
  }
}

main().catch(console.error);
