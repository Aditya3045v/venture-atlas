import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { blogSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

interface RouteContext {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    const validated = blogSchema.parse(json);

    const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    const updated = await prisma.blogPost.update({
      where: { id: params.id },
      data: {
        title: validated.title,
        excerpt: validated.excerpt,
        body: validated.body,
        categoryId: validated.categoryId,
        coverImage: validated.coverImage,
        readTimeMinutes: validated.readTimeMinutes,
        status: validated.status,
        publishedAt: validated.status === 'PUBLISHED' && !existing.publishedAt ? new Date() : existing.publishedAt,
      },
    });

    await logAuditEvent({
      action: 'UPDATE_BLOG',
      entityType: 'BLOG',
      entityId: updated.id,
      actor: user,
      metadata: { title: updated.title },
    });

    return NextResponse.json({ blog: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update blog' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();

  try {
    const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404 });
    }

    await prisma.blogPost.delete({ where: { id: params.id } });

    await logAuditEvent({
      action: 'DELETE_BLOG',
      entityType: 'BLOG',
      entityId: params.id,
      actor: user,
      metadata: { title: existing.title },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
