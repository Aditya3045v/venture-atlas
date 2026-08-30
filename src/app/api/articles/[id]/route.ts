import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { articleSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';
import { countWords } from '@/lib/sanitize';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  await ensureDatabaseSeeded();
  try {
    const article = await prisma.article.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
      },
    });

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    const validated = articleSchema.parse(json);
    const words = countWords(validated.summary);

    const existing = await prisma.article.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const updated = await prisma.article.update({
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

    // Log Audit
    await logAuditEvent({
      action: 'UPDATE_ARTICLE',
      entityType: 'ARTICLE',
      entityId: updated.id,
      actor: user,
      metadata: { title: updated.title, status: updated.status },
    });

    return NextResponse.json({ article: updated });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();

  try {
    const existing = await prisma.article.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    await prisma.article.delete({ where: { id: params.id } });

    await logAuditEvent({
      action: 'DELETE_ARTICLE',
      entityType: 'ARTICLE',
      entityId: params.id,
      actor: user,
      metadata: { title: existing.title },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
