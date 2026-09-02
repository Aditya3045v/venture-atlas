import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { categorySchema } from '@/lib/validation';
import { getCurrentUser, canPublish } from '@/lib/auth';
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

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}
