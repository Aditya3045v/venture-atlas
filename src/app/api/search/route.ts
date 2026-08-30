import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { SEED_ARTICLES } from '@/data/seedData';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ articles: [] });
  }

  // 1. Try Supabase
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*, category:categories(*), author:users(*)')
      .eq('status', 'PUBLISHED')
      .or(`title.ilike.%${q}%,summary.ilike.%${q}%,body.ilike.%${q}%`)
      .limit(30);

    if (!error && data && data.length > 0) {
      return NextResponse.json({ articles: data });
    }
  } catch (err) {
    console.warn('Supabase search fallback:', err);
  }

  // 2. Try Prisma
  try {
    await ensureDatabaseSeeded();
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q } },
          { summary: { contains: q } },
          { body: { contains: q } },
          { sourceName: { contains: q } },
        ],
      },
      include: {
        category: true,
        author: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 30,
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.warn('Prisma search fallback:', error);
  }

  // 3. Fallback to SeedData
  const lowerQ = q.toLowerCase();
  const matched = SEED_ARTICLES.filter(
    a =>
      a.title.toLowerCase().includes(lowerQ) ||
      a.summary.toLowerCase().includes(lowerQ) ||
      a.body.toLowerCase().includes(lowerQ) ||
      a.tags.some(t => t.toLowerCase().includes(lowerQ))
  ).map((a, i) => ({
    id: `seed-${i + 1}`,
    title: a.title,
    slug: a.slug,
    summary: a.summary,
    body: a.body,
    sourceName: a.sourceName,
    sourceUrl: a.sourceUrl,
    sourceAuthor: a.sourceAuthor,
    coverImage: a.coverImage,
    photoCredit: a.photoCredit,
    readTimeMinutes: a.readTimeMinutes,
    wordCount: a.wordCount,
    status: a.status,
    isFeatured: a.isFeatured,
    isTrending: a.isTrending,
    publishedAt: new Date(a.publishedAt),
    viewCount: a.viewCount,
    category: { name: a.categorySlug.toUpperCase(), slug: a.categorySlug, color: '#3B82F6' },
  }));

  return NextResponse.json({ articles: matched });
}
