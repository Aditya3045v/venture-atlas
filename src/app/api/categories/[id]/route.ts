import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { categorySchema } from '@/lib/validation';
import { getCurrentUser, canPublish } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function PUT(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || !canPublish(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Editor or Admin privileges required' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const validated = categorySchema.parse(json);

    const { data: updated, error } = await supabaseAdmin
      .from('categories')
      .update({
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        color: validated.color,
        display_order: validated.order || 0,
      })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase category update error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: 'UPDATE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: params.id,
      actor: user,
      metadata: { name: validated.name },
    });

    return NextResponse.json({ category: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || !canPublish(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Editor or Admin privileges required' }, { status: 403 });
  }

  try {
    // Check if category is currently in use across articles, blogs, or case studies
    const [
      { count: articleCount },
      { count: blogCount },
      { count: caseCount }
    ] = await Promise.all([
      supabaseAdmin.from('articles').select('*', { count: 'exact', head: true }).eq('category_id', params.id),
      supabaseAdmin.from('blog_posts').select('*', { count: 'exact', head: true }).eq('category_id', params.id),
      supabaseAdmin.from('case_studies').select('*', { count: 'exact', head: true }).eq('category_id', params.id),
    ]);

    const totalUsed = (articleCount || 0) + (blogCount || 0) + (caseCount || 0);
    if (totalUsed > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete category: ${totalUsed} content items (${articleCount || 0} briefs, ${blogCount || 0} essays, ${caseCount || 0} teardowns) are currently assigned to it. Please reassign them first.`
        },
        { status: 400 }
      );
    }

    const { error } = await supabaseAdmin
      .from('categories')
      .delete()
      .eq('id', params.id);

    if (error) {
      console.error('Supabase category delete error:', error);
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: 'DELETE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: params.id,
      actor: user,
      metadata: { id: params.id },
    });

    try {
      const { revalidateTag, revalidatePath } = require('next/cache');
      revalidateTag('categories');
      revalidatePath('/', 'layout');
    } catch {}

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to delete category' }, { status: 500 });
  }
}
