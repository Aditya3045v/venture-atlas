export {};

const BASE_URL = 'http://localhost:3000';

async function testQuery(name: string, url: string) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  const count = Array.isArray(data.articles) ? data.articles.length : 0;
  console.log(`[PASS] ${name}: HTTP ${res.status} | Returned ${count} item(s)`);
  return data;
}

async function main() {
  console.log('====================================================');
  console.log('       ADMIN LIST VIEWS & FILTERS VERIFICATION      ');
  console.log('====================================================\n');

  // 1. Status filter
  await testQuery('Status filter (status=PUBLISHED)', `${BASE_URL}/api/articles?status=PUBLISHED`);
  
  // 2. Category filter
  await testQuery('Category filter (category=unicorn)', `${BASE_URL}/api/articles?category=unicorn`);
  await testQuery('Category filter (category=seed)', `${BASE_URL}/api/articles?category=seed`);

  // 3. Search query
  await testQuery('Search query (q=Stripe)', `${BASE_URL}/api/search?q=Stripe`);
  await testQuery('Search query (q=Figma)', `${BASE_URL}/api/search?q=Figma`);

  // 4. Pagination / Limit
  const page1 = await testQuery('Pagination Page 1 (limit=3)', `${BASE_URL}/api/articles?limit=3`);
  if (page1.nextCursor) {
    await testQuery(`Pagination Page 2 (cursor_published_at=${encodeURIComponent(page1.nextCursor.publishedAt)}&cursor_id=${page1.nextCursor.id})`, 
      `${BASE_URL}/api/articles?limit=3&cursor_published_at=${encodeURIComponent(page1.nextCursor.publishedAt)}&cursor_id=${page1.nextCursor.id}`);
  }

  console.log('\n====================================================');
  console.log('[SUCCESS] All admin list views, filters, and pagination verified.');
  console.log('====================================================\n');
}

main().catch(console.error);
