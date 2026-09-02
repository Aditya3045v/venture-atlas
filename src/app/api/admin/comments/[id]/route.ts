import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser, canModerate } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || !canModerate(user.role)) {
    return NextResponse.json(
      { error: 'Unauthorized: Editor or Admin privileges required.' },
      { status: 403 }
    );
  }

  try {
    const body = await req.json();
    const { status } = body;

    if (!['APPROVED', 'REJECTED', 'PENDING'].includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const { data: updated, error } = await supabaseAdmin
      .from('comments')
      .update({ status })
      .eq('id', params.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: `COMMENT_${status}`,
      entityType: 'COMMENT' as any,
      entityId: params.id,
      actor: user,
      metadata: { newStatus: status, commentId: params.id },
    });

    return NextResponse.json({ success: true, comment: updated });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to update comment' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || !canModerate(user.role)) {
    return NextResponse.json(
      { error: 'Unauthorized: Editor or Admin privileges required.' },
      { status: 403 }
    );
  }

  try {
    const { error } = await supabaseAdmin
      .from('comments')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: 'COMMENT_DELETE',
      entityType: 'COMMENT' as any,
      entityId: params.id,
      actor: user,
      metadata: { commentId: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete comment' },
      { status: 500 }
    );
  }
}
