import { NextRequest, NextResponse } from 'next/server';
import { articleSchema } from '@/lib/validation';
import { getCurrentUser, canEdit, canPublish } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';
import { countWords } from '@/lib/sanitize';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revalidatePath, revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function GET(req: NextRequest, { params }: RouteContext) {
  try {
    const supabase = createServerSupabaseClient();
    const { data: article, error } = await supabase
      .from('articles')
      .select('*, category:categories(*), author:profiles(*)')
      .eq('id', params.id)
      .single();

    if (error || !article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    return NextResponse.json({ article });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch article' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || !canEdit(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Edit privileges required' }, { status: 403 });
  }

  try {
    const supabase = createServerSupabaseClient();

    // Check existing article ownership
    const { data: existing, error: findError } = await supabase
      .from('articles')
      .select('id, author_id, status, slug')
      .eq('id', params.id)
      .single();

    if (findError || !existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    // Permission enforcement: WRITER can only edit own drafts
    if (user.role === 'WRITER') {
      if (existing.author_id !== user.id) {
        return NextResponse.json(
          { error: 'PERMISSION_DENIED: Writers can only edit their own stories.' },
          { status: 403 }
        );
      }
    }

    const json = await req.json();
    const validated = articleSchema.parse(json);

    // Permission enforcement: WRITER cannot publish directly
    if (user.role === 'WRITER' && validated.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'PERMISSION_DENIED: Writers cannot publish articles directly.' },
        { status: 403 }
      );
    }

    const words = countWords(validated.summary);

    const updatePayload = {
      title: validated.title,
      summary: validated.summary,
      body: validated.body,
      category_id: validated.categoryId,
      source_name: validated.sourceName || null,
      source_url: validated.sourceUrl || null,
      source_author: validated.authorName || validated.sourceAuthor || user.name,
      cover_image: validated.coverImage || null,
      photo_credit: validated.photoCredit || null,
      word_count: words,
      read_time_minutes: Math.max(1, Math.ceil(words / 40)),
      status: validated.status as any,
      is_featured: validated.isFeatured || false,
      is_trending: validated.isTrending || false,
      scheduled_for: validated.scheduledFor ? new Date(validated.scheduledFor).toISOString() : null,
      published_at: validated.status === 'PUBLISHED' ? new Date().toISOString() : null,
      seo_title: validated.seoTitle || null,
      seo_description: validated.seoDescription || null,
      canvas_data: validated.canvasData || null,
    };

    const { data: updated, error: updateError } = await supabase
      .from('articles')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    await logAuditEvent({
      action: 'UPDATE_ARTICLE',
      entityType: 'ARTICLE',
      entityId: params.id,
      actor: user,
      metadata: { title: validated.title, status: validated.status },
    });

    // Invalidate caches
    try {
      revalidateTag('articles');
      if (updated?.slug) {
        revalidateTag(`article:${updated.slug}`);
        revalidatePath(`/articles/${updated.slug}`);
      }
      if (existing?.slug && existing.slug !== updated?.slug) {
        revalidateTag(`article:${existing.slug}`);
        revalidatePath(`/articles/${existing.slug}`);
      }
      revalidatePath('/');
      revalidatePath('/articles');
    } catch {
      // ignore
    }

    return NextResponse.json({ article: updated });
  } catch (error: any) {
    if (error.errors) {
      return NextResponse.json({ error: error.errors[0]?.message || 'Validation error' }, { status: 400 });
    }
    return NextResponse.json({ error: error?.message || 'Failed to update article' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || !canPublish(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Editor or Admin privileges required to delete' }, { status: 403 });
  }

  try {
    const supabase = createServerSupabaseClient();
    const { data: existing } = await supabase
      .from('articles')
      .select('slug')
      .eq('id', params.id)
      .single();

    const { error } = await supabase
      .from('articles')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: 'DELETE_ARTICLE',
      entityType: 'ARTICLE',
      entityId: params.id,
      actor: user,
      metadata: { id: params.id },
    });

    // Invalidate caches
    try {
      revalidateTag('articles');
      if (existing?.slug) {
        revalidateTag(`article:${existing.slug}`);
        revalidatePath(`/articles/${existing.slug}`);
      }
      revalidatePath('/');
      revalidatePath('/articles');
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete article' }, { status: 500 });
  }
}
