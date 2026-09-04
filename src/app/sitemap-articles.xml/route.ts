import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const baseUrl = SITE_URL;
  const nowIso = new Date().toISOString();

  // Query strictly PUBLISHED articles with published_at <= now()
  const { data: articles, error } = await supabaseAdmin
    .from('articles')
    .select('slug, updated_at, published_at')
    .eq('status', 'PUBLISHED')
    .lte('published_at', nowIso)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch articles for sitemap:', error);
  }

  const items = articles || [];

  const urlElements = items
    .map(art => {
      const lastmod = art.updated_at
        ? new Date(art.updated_at).toISOString()
        : art.published_at
        ? new Date(art.published_at).toISOString()
        : nowIso;

      return `  <url>
    <loc>${baseUrl}/articles/${art.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
