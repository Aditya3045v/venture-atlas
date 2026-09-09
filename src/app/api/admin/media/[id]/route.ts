import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser, canEdit } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: { id: string };
}

export async function DELETE(req: NextRequest, { params }: RouteContext) {
  const user = await getCurrentUser();
  if (!user || !canEdit(user.role)) {
    return NextResponse.json(
      { error: 'Unauthorized: Staff credentials required.' },
      { status: 403 }
    );
  }

  try {
    const { error } = await supabaseAdmin
      .from('media_assets')
      .delete()
      .eq('id', params.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: 'DELETE_MEDIA_ASSET',
      entityType: 'MEDIA' as any,
      entityId: params.id,
      actor: user,
      metadata: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to delete media asset' },
      { status: 500 }
    );
  }
}
