import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { statusChangeSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    const validated = statusChangeSchema.parse(json);

    const existing = await prisma.article.findUnique({ where: { id: params.id } });
    if (!existing) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 });
    }

    const updated = await prisma.article.update({
      where: { id: params.id },
      data: {
        status: validated.status,
        publishedAt:
          validated.status === 'PUBLISHED' && !existing.publishedAt
            ? new Date()
            : existing.publishedAt,
      },
    });

    await logAuditEvent({
      action: `STATUS_CHANGE_${validated.status}`,
      entityType: 'ARTICLE',
      entityId: updated.id,
      actor: user,
      metadata: {
        from: existing.status,
        to: validated.status,
        reason: validated.reason || null,
      },
    });

    return NextResponse.json({ article: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Status update failed' }, { status: 400 });
  }
}
