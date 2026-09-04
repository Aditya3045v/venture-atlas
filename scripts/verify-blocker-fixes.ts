async function runVerification() {
  const baseUrl = 'http://localhost:3000';
  
  console.log('================================================================================');
  console.log('BLOCKER 1 & 2 VERIFICATION: HEAD & JSON-LD AUDIT (DOMAIN: ventureatlas.in)');
  console.log('================================================================================\n');

  const pages = [
    { type: 'ARTICLE (60-WORD BRIEF)', path: '/articles/stripe-6b-round-2027-ipo' },
    { type: 'CASE STUDY (COMPANY TEARDOWN)', path: '/case-studies/stripe-infrastructure-leverage' },
    { type: 'BLOG (LONG-FORM ESSAY)', path: '/blogs/founder-mode-real-downside' },
    { type: 'CATEGORY HUB PAGE', path: '/categories/unicorn' },
  ];

  for (const p of pages) {
    console.log(`\n--------------------------------------------------------------------------------`);
    console.log(`RENDERED <head> FOR: ${p.type} (${p.path})`);
    console.log(`--------------------------------------------------------------------------------`);
    const res = await fetch(`${baseUrl}${p.path}`);
    const html = await res.text();
    
    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    if (headMatch) {
      console.log(headMatch[1].trim());
    }

    const headContent = headMatch ? headMatch[1] : '';

    // Check verification tokens in head
    const hasFakeGoogle = headContent.includes('google-site-verification-va-2026');
    const hasFakeBing = headContent.includes('bing-site-verification-va-2026');
    const hasAnyGoogle = headContent.includes('google-site-verification');
    const hasAnyBing = headContent.includes('msvalidate.01');
    const hasIoDomainInHead = headContent.includes('ventureatlas.io');
    const hasLocalhostInHead = headContent.includes('localhost:3000');

    console.log('\n--- HEAD VALIDATION CHECKS ---');
    console.log('Fake Google verification token in <head>:', hasFakeGoogle, '(MUST BE FALSE)');
    console.log('Fake Bing verification token in <head>:', hasFakeBing, '(MUST BE FALSE)');
    console.log('Any Google verification tag rendered when unset:', hasAnyGoogle, '(MUST BE FALSE)');
    console.log('Any Bing verification tag rendered when unset:', hasAnyBing, '(MUST BE FALSE)');
    console.log('Contains legacy .io domain in <head>:', hasIoDomainInHead, '(MUST BE FALSE)');
    console.log('Canonical/OG contains localhost in <head>:', hasLocalhostInHead, '(MUST BE FALSE)');
  }

  // Print full JSON-LD block
  console.log(`\n================================================================================`);
  console.log(`FULL JSON-LD BLOCK FOR /articles/stripe-6b-round-2027-ipo`);
  console.log(`================================================================================`);
  const briefRes = await fetch(`${baseUrl}/articles/stripe-6b-round-2027-ipo`);
  const briefHtml = await briefRes.text();
  const jsonLdMatch = briefHtml.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  if (jsonLdMatch) {
    const parsed = JSON.parse(jsonLdMatch[1]);
    console.log(JSON.stringify(parsed, null, 2));
  }

  // Print all 7 sitemaps and robots.txt
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

  console.log(`\n================================================================================`);
  console.log(`ALL SEVEN SITEMAPS AND ROBOTS.TXT AS SERVED LIVE`);
  console.log(`================================================================================`);

  for (const ep of endpoints) {
    const res = await fetch(`${baseUrl}${ep}`);
    const text = await res.text();
    console.log(`\n=== ENDPOINT: ${ep} (Status: ${res.status}) ===`);
    console.log(text.trim());
  }
}

runVerification().catch(console.error);
