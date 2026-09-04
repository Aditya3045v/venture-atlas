async function testSitemaps() {
  const endpoints = [
    '/robots.txt',
    '/sitemap.xml',
    '/sitemap-articles.xml',
    '/sitemap-case-studies.xml',
    '/sitemap-blogs.xml',
    '/sitemap-categories.xml',
    '/sitemap-pages.xml',
    '/sitemap-news.xml',
  ];

  for (const ep of endpoints) {
    const res = await fetch(`http://localhost:3000${ep}`);
    const text = await res.text();
    console.log(`\n================== ${ep} (Status: ${res.status}) ==================`);
    console.log(text.trim().slice(0, 500) + (text.length > 500 ? '\n...[truncated for log]' : ''));
  }
}
testSitemaps().catch(console.error);
