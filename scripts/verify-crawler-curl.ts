async function verifyCrawlerCurl() {
  console.log('=== TEST 1: CURL /articles/stripe-6b-round-2027-ipo (NO COOKIES) ===');
  const res = await fetch('http://localhost:3000/articles/stripe-6b-round-2027-ipo');
  console.log('HTTP Status:', res.status);
  const html = await res.text();

  console.log('\n--- FIRST 45 LINES OF SERVER-RENDERED HTML BODY ---');
  const bodyStart = html.indexOf('<body');
  const bodySlice = bodyStart !== -1 ? html.slice(bodyStart) : html;
  const lines = bodySlice.split('\n');
  console.log(lines.slice(0, 45).join('\n'));

  console.log('\n--- VERIFYING FULL TEXT CONTENT PRESENCE ---');
  const hasTitle = html.includes('Stripe Closes $6.5B Round');
  const hasSummary = html.includes('This is an editor edited sixty-word summary') || html.includes('sixty-word');
  const hasJsonLd = html.includes('application/ld+json');
  const hasBreadcrumbs = html.includes('Breadcrumb');
  const hasAttribution = html.includes('EDITORIAL SOURCING') || html.includes('EDITORIAL SOURCING &amp; ATTRIBUTION');

  console.log('Title present in initial HTML:', hasTitle);
  console.log('Summary/Body present in initial HTML:', hasSummary);
  console.log('JSON-LD schema present in initial HTML:', hasJsonLd);
  console.log('Breadcrumbs present in initial HTML:', hasBreadcrumbs);
  console.log('Attribution present in initial HTML:', hasAttribution);
}

verifyCrawlerCurl().catch(console.error);
