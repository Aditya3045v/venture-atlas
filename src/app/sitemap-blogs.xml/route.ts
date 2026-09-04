import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const baseUrl = SITE_URL;
  const nowIso = new Date().toISOString();

  // Query strictly PUBLISHED blog posts with published_at <= now()
  const { data: blogs, error } = await supabaseAdmin
    .from('blog_posts')
    .select('slug, updated_at, published_at')
    .eq('status', 'PUBLISHED')
    .lte('published_at', nowIso)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch blog posts for sitemap:', error);
  }

  const items = blogs || [];

  const urlElements = items
    .map(b => {
      const lastmod = b.updated_at
        ? new Date(b.updated_at).toISOString()
        : b.published_at
        ? new Date(b.published_at).toISOString()
        : nowIso;

      return `  <url>
    <loc>${baseUrl}/blogs/${b.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
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
