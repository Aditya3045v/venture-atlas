import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { categorySchema } from '@/lib/validation';
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
    const validated = categorySchema.parse(json);

    const updated = await prisma.category.update({
      where: { id: params.id },
      data: {
        name: validated.name,
        slug: validated.slug,
        description: validated.description,
        color: validated.color,
      },
    });

    await logAuditEvent({
      action: 'UPDATE_CATEGORY',
      entityType: 'CATEGORY',
      entityId: updated.id,
      actor: user,
      metadata: { name: updated.name },
    });

    return NextResponse.json({ category: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to update category' }, { status: 400 });
  }
}
