import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { statusChangeSchema } from '@/lib/validation';
import { getCurrentUser } from '@/lib/auth';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();

  try {
    const json = await req.json();
    const validated = statusChangeSchema.parse(json);

    // 1. Try Supabase
    try {
      await supabaseAdmin
        .from('articles')
        .update({
          status: validated.status,
          published_at: validated.status === 'PUBLISHED' ? new Date().toISOString() : null,
        })
        .eq('id', params.id);
    } catch {
      // fallback
    }

    // 2. Try Prisma
    let updated = null;
    try {
      const existing = await prisma.article.findUnique({ where: { id: params.id } });
      if (existing) {
        updated = await prisma.article.update({
          where: { id: params.id },
          data: {
            status: validated.status,
            publishedAt:
              validated.status === 'PUBLISHED' && !existing.publishedAt
                ? new Date()
                : existing.publishedAt,
          },
        });
      }
    } catch {
      // fallback
    }

    await logAuditEvent({
      action: `STATUS_CHANGE_${validated.status}`,
      entityType: 'ARTICLE',
      entityId: params.id,
      actor: user,
      metadata: {
        to: validated.status,
        reason: validated.reason || null,
      },
    });

    return NextResponse.json({ article: updated || { id: params.id, status: validated.status } });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Status update failed' }, { status: 400 });
  }
}
