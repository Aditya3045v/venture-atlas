async function validateSchemas() {
  const testPages = [
    { name: 'Homepage (Organization, WebSite, ItemList)', url: 'http://localhost:3000/' },
    { name: '60-Word Brief (NewsArticle, BreadcrumbList)', url: 'http://localhost:3000/articles/stripe-6b-round-2027-ipo' },
    { name: 'Blog Essay (Article, BreadcrumbList)', url: 'http://localhost:3000/blogs/founder-mode-real-downside' },
    { name: 'Case Study (Article, BreadcrumbList)', url: 'http://localhost:3000/case-studies/stripe-infrastructure-leverage' },
    { name: 'Category Hub (ItemList, BreadcrumbList)', url: 'http://localhost:3000/categories/unicorn' },
    { name: 'About Page (Organization, BreadcrumbList)', url: 'http://localhost:3000/about' },
    { name: 'Author Page (Person, BreadcrumbList)', url: 'http://localhost:3000/authors/aditya-poddar' },
  ];

  console.log('================================================================');
  console.log('REAL SCHEMA.ORG & GOOGLE RICH RESULTS VALIDATION AUDIT');
  console.log('================================================================\n');

  let totalSchemasFound = 0;
  let totalErrors = 0;

  for (const page of testPages) {
    console.log(`\n>>> Inspecting Page: ${page.name}`);
    console.log(`    URL: ${page.url}`);

    try {
      const res = await fetch(page.url);
      console.log(`    HTTP Status: ${res.status}`);
      const html = await res.text();

      // Extract all ld+json blocks using regex
      const regex = /<script\s+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
      let match;
      const scriptContents: string[] = [];
      while ((match = regex.exec(html)) !== null) {
        scriptContents.push(match[1]);
      }

      console.log(`    Found ${scriptContents.length} JSON-LD block(s) in server-rendered HTML`);

      scriptContents.forEach((raw, idx) => {
        totalSchemasFound++;
        try {
          const parsed = JSON.parse(raw.trim());
          console.log(`\n    [Schema #${idx + 1}] @type: ${parsed['@type'] || parsed['@graph']?.[0]?.['@type']}`);
          console.log('    --------------------------------------------------------');

          // Validate Schema.org context
          if (parsed['@context'] !== 'https://schema.org') {
            console.error(`    ❌ Context error: Expected "https://schema.org", got "${parsed['@context']}"`);
            totalErrors++;
          } else {
            console.log('    ✓ @context: https://schema.org');
          }

          // Specific Schema Checks
          if (parsed['@type'] === 'NewsArticle') {
            if (!parsed.headline) { console.error('    ❌ NewsArticle missing headline'); totalErrors++; }
            else console.log(`    ✓ headline: "${parsed.headline}"`);

            if (!parsed.datePublished || !parsed.datePublished.includes('T')) {
              console.error('    ❌ datePublished missing or invalid ISO 8601'); totalErrors++;
            } else console.log(`    ✓ datePublished (ISO 8601): ${parsed.datePublished}`);

            if (!parsed.dateModified) {
              console.error('    ❌ dateModified missing'); totalErrors++;
            } else console.log(`    ✓ dateModified (ISO 8601): ${parsed.dateModified}`);

            if (!parsed.author || parsed.author['@type'] !== 'Person') {
              console.error('    ❌ author must be Person schema'); totalErrors++;
            } else console.log(`    ✓ author: Person ("${parsed.author.name}") with @id: ${parsed.author['@id']}`);

            if (!parsed.publisher || parsed.publisher['@type'] !== 'Organization') {
              console.error('    ❌ publisher must be Organization'); totalErrors++;
            } else console.log(`    ✓ publisher: Organization ("${parsed.publisher.name}") with logo: ${parsed.publisher.logo.url}`);

            if (!parsed.image) { console.error('    ❌ image is required for NewsArticle'); totalErrors++; }
            else console.log(`    ✓ image: ${parsed.image}`);
          }

          if (parsed['@type'] === 'Article') {
            console.log(`    ✓ strictly Article (not NewsArticle) for long-form / case study`);
            if (!parsed.headline) { console.error('    ❌ Article missing headline'); totalErrors++; }
            else console.log(`    ✓ headline: "${parsed.headline}"`);

            if (!parsed.datePublished) { console.error('    ❌ datePublished missing'); totalErrors++; }
            else console.log(`    ✓ datePublished: ${parsed.datePublished}`);

            if (!parsed.author) { console.error('    ❌ author missing'); totalErrors++; }
            else console.log(`    ✓ author: ${parsed.author.name}`);
          }

          if (parsed['@type'] === 'Organization') {
            console.log(`    ✓ Organization: ${parsed.name} | url: ${parsed.url}`);
            if (!parsed.logo) { console.error('    ❌ Organization missing logo'); totalErrors++; }
            else console.log(`    ✓ logo: ${parsed.logo.url}`);
          }

          if (parsed['@type'] === 'WebSite') {
            console.log(`    ✓ WebSite: ${parsed.name}`);
            if (parsed.potentialAction?.['@type'] === 'SearchAction') {
              console.log(`    ✓ SearchAction target: ${parsed.potentialAction.target}`);
            } else {
              console.error('    ❌ WebSite missing SearchAction'); totalErrors++;
            }
          }

          if (parsed['@type'] === 'BreadcrumbList') {
            const count = parsed.itemListElement?.length || 0;
            console.log(`    ✓ BreadcrumbList with ${count} items:`);
            (parsed.itemListElement || []).forEach((el: any) => {
              console.log(`      - Position ${el.position}: ${el.name} (${el.item})`);
            });
          }

          if (parsed['@type'] === 'ItemList') {
            const count = parsed.itemListElement?.length || 0;
            console.log(`    ✓ ItemList ("${parsed.name}") with ${count} items`);
          }

          if (parsed['@type'] === 'Person') {
            console.log(`    ✓ Person: ${parsed.name} | jobTitle: ${parsed.jobTitle} | @id: ${parsed['@id']}`);
          }

        } catch (e: any) {
          console.error(`    ❌ Invalid JSON-LD syntax:`, e.message);
          totalErrors++;
        }
      });
    } catch (err: any) {
      console.error(`    ❌ Fetch error:`, err.message);
      totalErrors++;
    }
  }

  console.log('\n================================================================');
  console.log(`AUDIT COMPLETE: ${totalSchemasFound} Schemas Found | ${totalErrors} Errors`);
  console.log('================================================================');
}

validateSchemas().catch(console.error);
