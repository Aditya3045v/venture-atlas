import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { categorySchema } from '@/lib/validation';
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
    const validated = categorySchema.parse(json);

    // 1. Try Supabase
    try {
      await supabaseAdmin
        .from('categories')
        .update({
          name: validated.name,
          slug: validated.slug,
          description: validated.description,
          color: validated.color,
          order: validated.order,
        })
        .eq('id', params.id);
    } catch {
      // fallback
    }

    // 2. Try Prisma
    let updated = null;
    try {
      updated = await prisma.category.update({
        where: { id: params.id },
        data: {
          name: validated.name,
          slug: validated.slug,
          description: validated.description,
          color: validated.color,
        },
      });
    } catch {
      // fallback
    }

    await logAuditEvent({
      action: 'UPDATE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: params.id,
      actor: user,
      metadata: { name: validated.name },
    });

    return NextResponse.json({ category: updated || { id: params.id, ...validated } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 400 });
  }
}
