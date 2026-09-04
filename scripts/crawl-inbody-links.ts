/**
 * scripts/crawl-inbody-links.ts
 *
 * In-body contextual internal link crawler:
 * - Excludes <header>, <footer>, <nav>, <aside>, breadcrumbs, and menus.
 * - Extracts only in-body editorial / contextual links.
 * - Calculates click depth and in-body inbound link count per page.
 * - Flags any page with zero in-body inbound links.
 *
 * Run: npx tsx --env-file=.env scripts/crawl-inbody-links.ts
 */
const BASE_URL = 'http://localhost:3000';

interface PageMetrics {
  path: string;
  depth: number;
  inbodyInboundCount: number;
  inbodyInboundFrom: string[];
}

function extractInBodyLinks(html: string, currentPath: string): string[] {
  // Strip head, script, style
  let body = html;
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (bodyMatch) body = bodyMatch[1];

  // Strip header, footer, nav, aside
  body = body.replace(/<header[\s\S]*?<\/header>/gi, '');
  body = body.replace(/<footer[\s\S]*?<\/footer>/gi, '');
  body = body.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  body = body.replace(/<aside[\s\S]*?<\/aside>/gi, '');

  // Strip elements with class/id/role containing nav, footer, header, breadcrumb
  body = body.replace(/<div[^>]*class="[^"]*(?:nav|footer|header|breadcrumb)[^"]*"[\s\S]*?<\/div>/gi, '');

  // Extract <a href="...">
  const linkRegex = /<a\s+(?:[^>]*?\s+)?href=(["'])(.*?)\1/gi;
  const links: string[] = [];
  let match;

  while ((match = linkRegex.exec(body)) !== null) {
    let href = match[2].trim();
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:') || href.startsWith('javascript:')) {
      continue;
    }

    // Convert absolute site url to relative path
    if (href.startsWith('https://ventureatlas.in')) {
      href = href.replace('https://ventureatlas.in', '');
    } else if (href.startsWith('http://localhost:3000')) {
      href = href.replace('http://localhost:3000', '');
    } else if (href.startsWith('http://') || href.startsWith('https://')) {
      // External link
      continue;
    }

    // Normalize path
    const cleanPath = href.split('?')[0].split('#')[0] || '/';
    if (cleanPath.startsWith('/admin') || cleanPath.startsWith('/api') || cleanPath.match(/\.(png|jpg|jpeg|svg|ico|xml|txt)$/)) {
      continue;
    }

    if (!links.includes(cleanPath)) {
      links.push(cleanPath);
    }
  }

  return links;
}

async function runCrawler() {
  console.log('====================================================');
  console.log('    IN-BODY CONTEXTUAL INTERNAL LINK CRAWLER        ');
  console.log('====================================================\n');

  const pages = new Map<string, PageMetrics>();
  const queue: Array<{ path: string; depth: number }> = [{ path: '/', depth: 0 }];
  pages.set('/', { path: '/', depth: 0, inbodyInboundCount: 0, inbodyInboundFrom: [] });

  const visited = new Set<string>();

  // Fetch all known sitemap URLs to ensure full universe coverage
  const sitemapRes = await fetch(`${BASE_URL}/sitemap-pages.xml`);
  const sitemapArticlesRes = await fetch(`${BASE_URL}/sitemap-articles.xml`);
  const sitemapBlogsRes = await fetch(`${BASE_URL}/sitemap-blogs.xml`);
  const sitemapCasesRes = await fetch(`${BASE_URL}/sitemap-case-studies.xml`);
  const sitemapCatsRes = await fetch(`${BASE_URL}/sitemap-categories.xml`);

  const allXml = [
    await sitemapRes.text(),
    await sitemapArticlesRes.text(),
    await sitemapBlogsRes.text(),
    await sitemapCasesRes.text(),
    await sitemapCatsRes.text(),
  ].join('\n');

  const allKnownUrls = Array.from(allXml.matchAll(/<loc>(.*?)<\/loc>/g))
    .map(m => m[1].replace('https://ventureatlas.in', '').replace('http://localhost:3000', ''))
    .filter(p => p && !p.endsWith('.xml'));

  for (const url of allKnownUrls) {
    if (!pages.has(url)) {
      pages.set(url, { path: url, depth: Infinity, inbodyInboundCount: 0, inbodyInboundFrom: [] });
    }
  }

  while (queue.length > 0) {
    const { path, depth } = queue.shift()!;
    if (visited.has(path)) continue;
    visited.add(path);

    try {
      const res = await fetch(`${BASE_URL}${path}`, { redirect: 'manual' });
      if (res.status !== 200) continue;

      const html = await res.text();
      const inBodyLinks = extractInBodyLinks(html, path);

      for (const target of inBodyLinks) {
        if (!pages.has(target)) {
          pages.set(target, { path: target, depth: depth + 1, inbodyInboundCount: 0, inbodyInboundFrom: [] });
        }

        const targetMetrics = pages.get(target)!;
        if (!targetMetrics.inbodyInboundFrom.includes(path)) {
          targetMetrics.inbodyInboundCount++;
          targetMetrics.inbodyInboundFrom.push(path);
        }
        if (targetMetrics.depth > depth + 1) {
          targetMetrics.depth = depth + 1;
        }

        if (!visited.has(target)) {
          queue.push({ path: target, depth: depth + 1 });
        }
      }
    } catch (e: any) {
      console.error(`Error crawling ${path}:`, e.message);
    }
  }

  // Crawl any remaining unvisited sitemap pages to compute their outbound links too
  for (const [path, metrics] of Array.from(pages.entries())) {
    if (!visited.has(path)) {
      try {
        const res = await fetch(`${BASE_URL}${path}`, { redirect: 'manual' });
        if (res.status === 200) {
          const html = await res.text();
          const inBodyLinks = extractInBodyLinks(html, path);
          for (const target of inBodyLinks) {
            if (pages.has(target)) {
              const targetMetrics = pages.get(target)!;
              if (!targetMetrics.inbodyInboundFrom.includes(path)) {
                targetMetrics.inbodyInboundCount++;
                targetMetrics.inbodyInboundFrom.push(path);
              }
            }
          }
        }
      } catch {}
    }
  }

  console.log('=== IN-BODY INTERNAL LINK METRICS PER PAGE ===\n');
  const tableData = Array.from(pages.values()).map(p => ({
    'Path': p.path,
    'Click Depth': p.depth === Infinity ? 'Orphan (>10)' : p.depth,
    'In-Body Inbound Links': p.inbodyInboundCount,
    'Sample Inbound Sources': p.inbodyInboundFrom.slice(0, 3).join(', ') || 'NONE'
  }));

  console.table(tableData);

  const zeroInbound = Array.from(pages.values()).filter(p => p.path !== '/' && p.inbodyInboundCount === 0);
  console.log(`\nTotal Public Pages Audited: ${pages.size}`);
  console.log(`Pages with ≥1 In-Body Inbound Link: ${pages.size - zeroInbound.length}`);
  console.log(`Pages with ZERO In-Body Inbound Links: ${zeroInbound.length}`);

  if (zeroInbound.length > 0) {
    console.warn('\nPages with Zero In-Body Inbound Links (Candidate Orphans):');
    zeroInbound.forEach(p => console.warn(`  • ${p.path} (Depth: ${p.depth})`));
  } else {
    console.log('✓ ZERO ORPHAN PAGES: Every single page has in-body contextual inbound links.');
  }
}

runCrawler().catch(console.error);
