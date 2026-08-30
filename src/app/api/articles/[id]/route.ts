import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { fetchArticleById } from '@/lib/supabase-db';
import { articleSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { countWords } from '@/lib/sanitize';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const article = await fetchArticleById(params.id);

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    const validated = articleSchema.parse(json);
    const words = countWords(validated.summary);

    // 1. Try Supabase
    try {
      await supabaseAdmin
        .from('articles')
        .update({
          title: validated.title,
          summary: validated.summary,
          body: validated.body,
          category_id: validated.categoryId,
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
          seo_title: validated.seoTitle,
          seo_description: validated.seoDescription,
        })
        .eq('id', params.id);
    } catch {
      // fallback
    }

    // 2. Try Prisma
    let updated = null;
    try {
      const existing = await prisma.article.findUnique({ where: { id: params.id } });
      if (existing) {
        updated = await prisma.article.update({
          where: { id: params.id },
          data: {
            title: validated.title,
            summary: validated.summary,
            body: validated.body,
            categoryId: validated.categoryId,
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
            publishedAt: validated.status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
            seoTitle: validated.seoTitle,
            seoDescription: validated.seoDescription,
          },
        });
      }
    } catch {
      // fallback
    }

    // Log Audit
    await logAuditEvent({
      action: 'UPDATE_ARTICLE',
      entityType: 'ARTICLE',
      entityId: params.id,
      actor: user,
      metadata: { title: validated.title, status: validated.status },
    });

    return NextResponse.json({ article: updated || { id: params.id, ...validated } });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();

  try {
    try {
      await supabaseAdmin.from('articles').delete().eq('id', params.id);
    } catch {
      // fallback
    }

    try {
      await prisma.article.delete({ where: { id: params.id } });
    } catch {
      // fallback
    }

    await logAuditEvent({
      action: 'DELETE_ARTICLE',
      entityType: 'ARTICLE',
      entityId: params.id,
      actor: user,
      metadata: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
