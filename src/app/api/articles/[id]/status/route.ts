import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { statusChangeSchema } from '@/lib/validation';
import { getCurrentUser, canPublish } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';
import { revalidatePath, revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || !canPublish(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Editor or Admin privileges required' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const validated = statusChangeSchema.parse(json);

    const { data: updated, error } = await supabaseAdmin
      .from('articles')
      .update({
        status: validated.status as any,
        published_at: validated.status === 'PUBLISHED' ? new Date().toISOString() : null,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase article status update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: `STATUS_CHANGE_${validated.status}`,
      entityType: 'ARTICLE',
      entityId: params.id,
      actor: user,
      metadata: {
        to: validated.status,
      },
    });

    // Invalidate cache
    try {
      revalidateTag('articles');
      if (updated?.slug) {
        revalidateTag(`article:${updated.slug}`);
        revalidatePath(`/articles/${updated.slug}`);
      }
      revalidatePath('/');
      revalidatePath('/articles');
    } catch {
      // ignore
    }

    return NextResponse.json({ success: true, status: validated.status, article: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update article status' },
      { status: 400 }
    );
  }
}
