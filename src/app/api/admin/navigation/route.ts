import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser, canEdit } from '@/lib/auth/staff';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { revalidatePath, revalidateTag } from 'next/cache';
import { fetchAdminNavigationItems } from '@/lib/data/navigation';
import { z } from 'zod';

export const dynamic = 'force-dynamic';

const navItemSchema = z.object({
  label: z.string().min(1, 'Label is required').max(50),
  href: z.string().min(1, 'Path/URL is required').max(200),
  orderNum: z.number().int().default(0),
  isActive: z.boolean().default(true),
});

const batchReorderSchema = z.object({
  items: z.array(z.object({
    id: z.string().min(1),
    orderNum: z.number().int(),
    isActive: z.boolean().optional(),
  })),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Administrator privileges required.' }, { status: 403 });
  }

  const items = await fetchAdminNavigationItems();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Administrator privileges required.' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const validated = navItemSchema.parse(json);

    const { data, error } = await supabaseAdmin
      .from('navigation_items')
      .insert({
        label: validated.label,
        href: validated.href,
        order_num: validated.orderNum,
        is_active: validated.isActive,
      })
      .select()
      .single();

    if (error || !data) {
      return NextResponse.json({ error: error?.message || 'Failed to create nav item' }, { status: 500 });
    }

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      action: 'NAV_ITEM_CREATED',
      entity_type: 'NAVIGATION',
      entity_id: data.id,
      actor_id: user.id,
      actor_email: user.email,
      actor_role: user.role,
      metadata: { label: data.label, href: data.href },
    });

    // Invalidate caches
    revalidateTag('navigation');
    revalidatePath('/', 'layout');

    return NextResponse.json({ success: true, item: data }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid payload' }, { status: 400 });
  }
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized: Administrator privileges required.' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const validated = batchReorderSchema.parse(json);

    for (const item of validated.items) {
      const updateData: any = {
        order_num: item.orderNum,
        updated_at: new Date().toISOString(),
      };
      if (item.isActive !== undefined) {
        updateData.is_active = item.isActive;
      }
      await supabaseAdmin
        .from('navigation_items')
        .update(updateData)
        .eq('id', item.id);
    }

    // Audit log
    await supabaseAdmin.from('audit_logs').insert({
      action: 'NAV_ITEMS_REORDERED',
      entity_type: 'NAVIGATION',
      actor_id: user.id,
      actor_email: user.email,
      actor_role: user.role,
      metadata: { itemCount: validated.items.length },
    });

    // Invalidate caches
    revalidateTag('navigation');
    revalidatePath('/', 'layout');

    const updatedItems = await fetchAdminNavigationItems();
    return NextResponse.json({ success: true, items: updatedItems });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Invalid batch payload' }, { status: 400 });
  }
}
