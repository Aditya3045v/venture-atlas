import { NextResponse } from 'next/server';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';
export const revalidate = 86400;

export async function GET() {
  const baseUrl = SITE_URL;
  const nowIso = new Date().toISOString();

  const pages = [
    { path: '', priority: '1.0', changefreq: 'always' },
    { path: '/landing', priority: '0.9', changefreq: 'weekly' },
    { path: '/about', priority: '0.9', changefreq: 'monthly' },
    { path: '/case-studies', priority: '0.9', changefreq: 'daily' },
    { path: '/blogs', priority: '0.8', changefreq: 'daily' },
    { path: '/search', priority: '0.5', changefreq: 'weekly' },
    { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
    { path: '/terms', priority: '0.3', changefreq: 'monthly' },
    { path: '/cookies', priority: '0.3', changefreq: 'monthly' },
    { path: '/imprint', priority: '0.3', changefreq: 'monthly' },
  ];

  const urlElements = pages
    .map(
      p => `  <url>
    <loc>${baseUrl}${p.path}</loc>
    <lastmod>${nowIso}</lastmod>
    <changefreq>${p.changefreq}</changefreq>
    <priority>${p.priority}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
}
