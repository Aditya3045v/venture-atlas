import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canEdit } from '@/lib/auth/staff';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath, revalidateTag } from 'next/cache';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const updateNavItemSchema = z.object({
  label: z.string().min(1).max(50).optional(),
  href: z.string().min(1).max(200).optional(),
  orderNum: z.number().int().optional(),
  isActive: z.boolean().optional(),
});

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Administrator privileges required.' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const validated = updateNavItemSchema.parse(json);

    const updatePayload: any = {
      updated_at: new Date().toISOString(),
    };
    if (validated.label !== undefined) updatePayload.label = validated.label;
    if (validated.href !== undefined) updatePayload.href = validated.href;
    if (validated.orderNum !== undefined) updatePayload.order_num = validated.orderNum;
    if (validated.isActive !== undefined) updatePayload.is_active = validated.isActive;

    const { data, error } = await supabaseAdmin
      .from('navigation_items')
      .update(updatePayload)
      .eq('id', params.id)
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to update nav item' }, { status: 500 });
    }

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      action: 'NAV_ITEM_UPDATED',
      entity_type: 'NAVIGATION',
      entity_id: params.id,
      actor_id: user.id,
      actor_email: user.email,
      actor_role: user.role,
      metadata: updatePayload,
    });

    // Invalidate caches
    revalidateTag('navigation');
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, item: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid payload' }, { status: 400 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Administrator privileges required.' }, { status: 403 });
  }

  try {
    const { data: existing } = await supabaseAdmin
      .from('navigation_items')
      .select('*')
      .eq('id', params.id)
      .single();

    const { error } = await supabaseAdmin
      .from('navigation_items')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      action: 'NAV_ITEM_DELETED',
      entity_type: 'NAVIGATION',
      entity_id: params.id,
      actor_id: user.id,
      actor_email: user.email,
      actor_role: user.role,
      metadata: existing ? { label: existing.label, href: existing.href } : null,
    });

    // Invalidate caches
    revalidateTag('navigation');
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Delete error' }, { status: 500 });
  }
}
