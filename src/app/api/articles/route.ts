import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { articleSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { slugify, countWords } from '@/lib/sanitize';

export async function GET(req: NextRequest) {
  await ensureDatabaseSeeded();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const all = searchParams.get('all') === 'true';

  try {
    const where: Record<string, unknown> = {};
    if (!all) {
      where.status = 'PUBLISHED';
    }
    if (category) {
      where.category = { slug: category };
    }

    const articles = await prisma.article.findMany({
      where,
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 50,
    });

    return NextResponse.json({ articles });
  } catch (error) {
    console.error('API /api/articles GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    const validated = articleSchema.parse(json);

    // Generate unique slug
    let baseSlug = slugify(validated.title);
    let slug = baseSlug;
    let counter = 1;
    while (await prisma.article.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const words = countWords(validated.summary);

    const article = await prisma.article.create({
      data: {
        title: validated.title,
        slug,
        summary: validated.summary,
        body: validated.body,
        categoryId: validated.categoryId,
        authorId: user?.id,
        sourceName: validated.sourceName,
        sourceUrl: validated.sourceUrl,
        sourceAuthor: validated.sourceAuthor,
        coverImage: validated.coverImage,
        photoCredit: validated.photoCredit,
        wordCount: words,
        readTimeMinutes: Math.max(1, Math.ceil(words / 40)),
        status: validated.status,
        isFeatured: validated.isFeatured,
        isTrending: validated.isTrending,
        scheduledFor: validated.scheduledFor ? new Date(validated.scheduledFor) : null,
        publishedAt: validated.status === 'PUBLISHED' ? new Date() : null,
        seoTitle: validated.seoTitle,
        seoDescription: validated.seoDescription,
      },
    });

    // Handle tags
    if (validated.tags && validated.tags.length > 0) {
      for (const tagName of validated.tags) {
        const tagSlug = slugify(tagName);
        const tag = await prisma.tag.upsert({
          where: { slug: tagSlug },
          update: {},
          create: { name: tagName, slug: tagSlug },
        });

        await prisma.articleTag.create({
          data: {
            articleId: article.id,
            tagId: tag.id,
          },
        });
      }
    }

    // Log Audit
    await logAuditEvent({
      action: validated.status === 'PUBLISHED' ? 'PUBLISH_ARTICLE' : 'CREATE_ARTICLE',
      entityType: 'ARTICLE',
      entityId: article.id,
      actor: user,
      metadata: { title: article.title, status: article.status, slug: article.slug },
    });

    return NextResponse.json({ article }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/articles POST error:', error);
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
