import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { blogSchema } from '@/lib/validation';
import { getCurrentUser, canEdit, canPublish } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || !canEdit(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Edit privileges required' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const validated = blogSchema.parse(json);

    const { data: updated, error } = await supabaseAdmin
      .from('blog_posts')
      .update({
        title: validated.title,
        excerpt: validated.excerpt,
        body: validated.body,
        category_id: validated.categoryId,
        cover_image: validated.coverImage,
        read_time_minutes: validated.readTimeMinutes || 4,
        status: validated.status as any,
        published_at: validated.status === 'PUBLISHED' ? new Date().toISOString() : null,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase blog update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: 'UPDATE_BLOG',
      entityType: 'BLOG',
      entityId: params.id,
      actor: user,
      metadata: { title: validated.title },
    });

    return NextResponse.json({ blog: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update blog' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || !canPublish(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Editor or Admin privileges required' }, { status: 403 });
  }

  try {
    const { error } = await supabaseAdmin
      .from('blog_posts')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Supabase blog delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
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
