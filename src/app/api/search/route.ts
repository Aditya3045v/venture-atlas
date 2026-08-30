import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q') || '';

  if (!q.trim()) {
    return NextResponse.json({ articles: [] });
  }

  try {
    const articles = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        OR: [
          { title: { contains: q } },
          { summary: { contains: q } },
          { body: { contains: q } },
          { sourceName: { contains: q } },
          { tags: { some: { tag: { name: { contains: q } } } } },
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
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Search failed' }, { status: 500 });
  }
}
