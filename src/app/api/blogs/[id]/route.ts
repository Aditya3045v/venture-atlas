import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { blogSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    const validated = blogSchema.parse(json);

    // 1. Try Supabase
    try {
      await supabaseAdmin
        .from('blog_posts')
        .update({
          title: validated.title,
          excerpt: validated.excerpt,
          body: validated.body,
          category_id: validated.categoryId,
          cover_image: validated.coverImage,
          read_time_minutes: validated.readTimeMinutes,
          status: validated.status,
          published_at: validated.status === 'PUBLISHED' ? new Date().toISOString() : null,
        })
        .eq('id', params.id);
    } catch {
      // fallback
    }

    // 2. Try Prisma
    let updated = null;
    try {
      const existing = await prisma.blogPost.findUnique({ where: { id: params.id } });
      if (existing) {
        updated = await prisma.blogPost.update({
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
      }
    } catch {
      // fallback
    }

    await logAuditEvent({
      action: 'UPDATE_BLOG',
      entityType: 'BLOG',
      entityId: params.id,
      actor: user,
      metadata: { title: validated.title },
    });

    return NextResponse.json({ blog: updated || { id: params.id, ...validated } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update blog' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();

  try {
    try {
      await supabaseAdmin.from('blog_posts').delete().eq('id', params.id);
    } catch {
      // fallback
    }

    try {
      await prisma.blogPost.delete({ where: { id: params.id } });
    } catch {
      // fallback
    }

    await logAuditEvent({
      action: 'DELETE_BLOG',
      entityType: 'BLOG',
      entityId: params.id,
      actor: user,
      metadata: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete blog' }, { status: 500 });
  }
}
