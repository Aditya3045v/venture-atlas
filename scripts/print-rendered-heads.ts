async function printHeads() {
  const urls = [
    { type: 'ARTICLE (60-WORD BRIEF)', url: 'http://localhost:3000/articles/stripe-6b-round-2027-ipo' },
    { type: 'CASE STUDY (COMPANY TEARDOWN)', url: 'http://localhost:3000/case-studies/stripe-infrastructure-leverage' },
    { type: 'BLOG (LONG-FORM ESSAY)', url: 'http://localhost:3000/blogs/founder-mode-real-downside' },
    { type: 'CATEGORY HUB PAGE', url: 'http://localhost:3000/categories/unicorn' },
  ];

  for (const item of urls) {
    console.log(`\n================================================================================`);
    console.log(`RENDERED <head> FOR ${item.type}`);
    console.log(`URL: ${item.url}`);
    console.log(`================================================================================`);

    const res = await fetch(item.url);
    const html = await res.text();

    const headMatch = html.match(/<head[^>]*>([\s\S]*?)<\/head>/i);
    if (headMatch) {
      console.log(headMatch[1].trim());
    } else {
      console.log('No <head> tag found');
    }
  }
}

printHeads().catch(console.error);
