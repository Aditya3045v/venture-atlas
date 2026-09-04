import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

export async function GET() {
  const baseUrl = SITE_URL;

  const robots = `# ==============================================================================
# Venture Atlas Crawl Directives & AI Discoverability Policy
# ==============================================================================

# Standard Search Crawlers
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /account/
Disallow: /bookmarks/
Disallow: /auth/

# AI Citation & Search Engines (Allowed for real-time citations & answer grounding)
User-agent: PerplexityBot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /account/
Disallow: /bookmarks/
Disallow: /auth/

User-agent: ClaudeBot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /account/
Disallow: /bookmarks/
Disallow: /auth/

User-agent: GPTBot
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /account/
Disallow: /bookmarks/
Disallow: /auth/

User-agent: Google-Extended
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /account/
Disallow: /bookmarks/
Disallow: /auth/

User-agent: Applebot-Extended
Allow: /
Disallow: /admin/
Disallow: /api/
Disallow: /account/
Disallow: /bookmarks/
Disallow: /auth/

# Bulk Unattributed Scrapers (Disallowed)
User-agent: CCBot
Disallow: /

# Sitemaps
Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/sitemap-news.xml
`;

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
