import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { SITE_URL } from '@/lib/site-url';

export const dynamic = 'force-dynamic';
export const revalidate = 3600;

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
  const now = new Date().toUTCString();

  const [articlesRes, blogsRes, casesRes] = await Promise.all([
    supabaseAdmin
      .from('articles')
      .select('slug, title, summary, published_at, category:categories(name)')
      .eq('status', 'PUBLISHED')
      .order('published_at', { ascending: false })
      .limit(20),
    supabaseAdmin
      .from('blog_posts')
      .select('slug, title, excerpt, published_at')
      .eq('status', 'PUBLISHED')
      .order('published_at', { ascending: false })
      .limit(10),
    supabaseAdmin
      .from('case_studies')
      .select('slug, title, summary, company, published_at')
      .eq('status', 'PUBLISHED')
      .order('published_at', { ascending: false })
      .limit(10),
  ]);

  const items: Array<{ title: string; link: string; description: string; pubDate: string; category?: string }> = [];

  for (const a of articlesRes.data || []) {
    items.push({
      title: a.title,
      link: `${baseUrl}/articles/${a.slug}`,
      description: a.summary || '',
      pubDate: a.published_at ? new Date(a.published_at).toUTCString() : now,
      category: (a as any).category?.name || 'News Brief',
    });
  }

  for (const b of blogsRes.data || []) {
    items.push({
      title: b.title,
      link: `${baseUrl}/blogs/${b.slug}`,
      description: b.excerpt || '',
      pubDate: b.published_at ? new Date(b.published_at).toUTCString() : now,
      category: 'Essay',
    });
  }

  for (const c of casesRes.data || []) {
    items.push({
      title: `${c.company}: ${c.title}`,
      link: `${baseUrl}/case-studies/${c.slug}`,
      description: c.summary || '',
      pubDate: c.published_at ? new Date(c.published_at).toUTCString() : now,
      category: 'Case Study',
    });
  }

  items.sort((a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime());

  const itemsXml = items
    .map(
      item => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${item.pubDate}</pubDate>
      ${item.category ? `<category>${escapeXml(item.category)}</category>` : ''}
    </item>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Venture Atlas</title>
    <link>${baseUrl}</link>
    <description>Executive venture capital intelligence, 60-word news briefs, and breakout company teardowns.</description>
    <language>en-us</language>
    <lastBuildDate>${now}</lastBuildDate>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}
