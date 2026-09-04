async function printHeadAndJsonLd() {
  const pages = [
    { type: 'ARTICLE (60-WORD BRIEF)', url: 'http://localhost:3000/articles/stripe-6b-round-2027-ipo' },
    { type: 'CASE STUDY (COMPANY TEARDOWN)', url: 'http://localhost:3000/case-studies/stripe-infrastructure-leverage' },
    { type: 'BLOG (LONG-FORM ESSAY)', url: 'http://localhost:3000/blogs/founder-mode-real-downside' },
    { type: 'CATEGORY HUB PAGE', url: 'http://localhost:3000/categories/unicorn' },
  ];

  for (const p of pages) {
    console.log('\n================================================================================');
    console.log('RENDERED <head> FOR ' + p.type);
    console.log('================================================================================');
    const res = await fetch(p.url);
    const html = await res.text();
    const head = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    console.log(head ? head[1].trim() : 'NO HEAD');
  }

  console.log('\n================================================================================');
  console.log('FULL SERVER-RENDERED JSON-LD FOR /articles/stripe-6b-round-2027-ipo');
  console.log('================================================================================');
  const briefRes = await fetch('http://localhost:3000/articles/stripe-6b-round-2027-ipo');
  const briefHtml = await briefRes.text();
  const jsonLdMatch = briefHtml.match(/<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
  console.log(jsonLdMatch ? JSON.stringify(JSON.parse(jsonLdMatch[1]), null, 2) : 'NO JSON-LD');
}
printHeadAndJsonLd().catch(console.error);
