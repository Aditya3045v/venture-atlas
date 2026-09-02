export {};

const BASE_URL = 'http://localhost:3000';

const endpoints = [
  { url: `${BASE_URL}/`, expected: 200, name: 'Homepage' },
  { url: `${BASE_URL}/articles/stripe-6b-round-2027-ipo`, expected: 200, name: 'Published Article Slug' },
  { url: `${BASE_URL}/blogs`, expected: 200, name: 'Blogs Index' },
  { url: `${BASE_URL}/case-studies`, expected: 200, name: 'Case Studies Index' },
  { url: `${BASE_URL}/categories/unicorn`, expected: 200, name: 'Category Slug (unicorn)' },
  { url: `${BASE_URL}/search`, expected: 200, name: 'Search Page' },
  { url: `${BASE_URL}/privacy`, expected: 200, name: 'Privacy Policy' },
  { url: `${BASE_URL}/terms`, expected: 200, name: 'Terms of Service' },
  { url: `${BASE_URL}/robots.txt`, expected: 200, name: 'robots.txt' },
  { url: `${BASE_URL}/sitemap.xml`, expected: 200, name: 'sitemap.xml' },
  { url: `${BASE_URL}/articles/anduril-autonomous-weapons-ai-defense`, expected: 404, name: 'DRAFT Article Slug (Security Gate)' },
  { url: `${BASE_URL}/articles/deepseek-r1-inference-efficiency-breakthrough`, expected: 404, name: 'SCHEDULED Article Slug (Security Gate)' },
];

async function main() {
  console.log('====================================================');
  console.log('     PUBLIC URLS & SECURITY GATE CURL AUDIT        ');
  console.log('====================================================\n');

  for (const ep of endpoints) {
    const res = await fetch(ep.url, {
      redirect: 'manual',
    });
    const status = res.status;
    const loc = res.headers.get('location') || 'none';
    const ct = res.headers.get('content-type') || 'none';
    const pass = status === ep.expected;

    console.log(`[${pass ? 'PASS' : 'FAIL'}] ${ep.name}`);
    console.log(`       URL: ${ep.url}`);
    console.log(`       HTTP Status: ${status} (Expected: ${ep.expected})`);
    console.log(`       Location Header: ${loc}`);
    console.log(`       Content-Type: ${ct}\n`);
  }
}

main().catch(console.error);
