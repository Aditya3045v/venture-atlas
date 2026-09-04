import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';
export const revalidate = 900; // 15-minute ISR for breaking news

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}

export async function GET() {
  const baseUrl = SITE_URL;
  const now = new Date();
  const fortyEightHoursAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000).toISOString();
  const nowIso = now.toISOString();

  // Query articles published strictly in the last 48 hours (Google News requirement)
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('slug, title, published_at, created_at')
    .eq('status', 'PUBLISHED')
    .gte('published_at', fortyEightHoursAgo)
    .lte('published_at', nowIso)
    .order('published_at', { ascending: false });

  const items = articles || [];

  const urlElements = items
    .map(art => {
      const pubDate = art.published_at
        ? new Date(art.published_at).toISOString()
        : new Date(art.created_at).toISOString();

      return `  <url>
    <loc>${baseUrl}/articles/${art.slug}</loc>
    <news:news>
      <news:publication>
        <news:name>Venture Atlas</news:name>
        <news:language>en</news:language>
      </news:publication>
      <news:publication_date>${pubDate}</news:publication_date>
      <news:title>${escapeXml(art.title)}</news:title>
    </news:news>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urlElements}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=900, s-maxage=900, stale-while-revalidate=3600',
    },
  });
}
