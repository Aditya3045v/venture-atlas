import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

export async function GET() {
  const baseUrl = SITE_URL;
  const nowIso = new Date().toISOString();

  // Query strictly PUBLISHED case studies with published_at <= now()
  const { data: caseStudies, error } = await supabaseAdmin
    .from('case_studies')
    .select('slug, updated_at, published_at')
    .eq('status', 'PUBLISHED')
    .lte('published_at', nowIso)
    .order('published_at', { ascending: false });

  if (error) {
    console.error('Failed to fetch case studies for sitemap:', error);
  }

  const items = caseStudies || [];

  const urlElements = items
    .map(cs => {
      const lastmod = cs.updated_at
        ? new Date(cs.updated_at).toISOString()
        : cs.published_at
        ? new Date(cs.published_at).toISOString()
        : nowIso;

      return `  <url>
    <loc>${baseUrl}/case-studies/${cs.slug}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
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
