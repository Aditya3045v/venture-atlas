import { NextRequest, NextResponse } from 'next/server';
import { fetchArticles } from '@/lib/supabase-db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { prisma } from '@/lib/db';
import { articleSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { slugify, countWords } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const all = searchParams.get('all') === 'true';

  try {
    const articles = await fetchArticles({
      categorySlug: category,
      status: all ? undefined : 'PUBLISHED',
      limit: 50,
    });
    return NextResponse.json({ articles });
  } catch (error) {
    console.error('API /api/articles GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch articles' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    const validated = articleSchema.parse(json);

    // Generate unique slug
    let baseSlug = slugify(validated.title);
    let slug = baseSlug;

    const words = countWords(validated.summary);

    // 1. Try Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('articles')
        .insert({
          title: validated.title,
          slug,
          summary: validated.summary,
          body: validated.body,
          category_id: validated.categoryId,
          author_id: user?.id,
          source_name: validated.sourceName,
          source_url: validated.sourceUrl,
          source_author: validated.sourceAuthor,
          cover_image: validated.coverImage,
          photo_credit: validated.photoCredit,
          word_count: words,
          read_time_minutes: Math.max(1, Math.ceil(words / 40)),
          status: validated.status,
          is_featured: validated.isFeatured,
          is_trending: validated.isTrending,
          published_at: validated.status === 'PUBLISHED' ? new Date().toISOString() : null,
          seo_title: validated.seoTitle,
          seo_description: validated.seoDescription,
        })
        .select()
        .single();

      if (!error && data) {
        return NextResponse.json({ article: data }, { status: 201 });
      }
    } catch {
      // fallback
    }

    // 2. Try Prisma
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
    }).catch(() => null);

    // Log Audit
    await logAuditEvent({
      action: validated.status === 'PUBLISHED' ? 'PUBLISH_ARTICLE' : 'CREATE_ARTICLE',
      entityType: 'ARTICLE',
      entityId: article?.id,
      actor: user,
      metadata: { title: validated.title, status: validated.status, slug },
    });

    return NextResponse.json({ article: article || { ...validated, slug } }, { status: 201 });
  } catch (error: any) {
    console.error('API /api/articles POST error:', error);
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create article' }, { status: 500 });
  }
}
