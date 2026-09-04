import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const baseUrl = SITE_URL;
  const nowIso = new Date().toISOString();

  const { data: categories, error } = await supabaseAdmin
    .from('categories')
    .select('slug, updated_at')
    .order('display_order', { ascending: true });

  if (error) {
    console.error('Failed to fetch categories for sitemap:', error);
  }

  const items = categories || [];

  const urlElements = items
    .map(cat => {
      const lastmod = cat.updated_at
        ? new Date(cat.updated_at).toISOString()
        : nowIso;

      return `  <url>
    <loc>${baseUrl}/categories/${cat.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>hourly</changefreq>
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
