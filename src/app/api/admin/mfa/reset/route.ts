import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser, canManageUsers } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const currentUser = await getCurrentUser();
  if (!currentUser || !canManageUsers(currentUser.role)) {
    return NextResponse.json({ error: 'Unauthorized: Admin privileges required.' }, { status: 403 });
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { targetUserId } = body;

    if (!targetUserId || typeof targetUserId !== 'string') {
      return NextResponse.json({ error: 'Target user ID is required.' }, { status: 400 });
    }

    // 1. Fetch user factors from Supabase Auth admin API
    const { data: factorsData, error: factorsError } = await supabaseAdmin.auth.admin.mfa.listFactors({
      userId: targetUserId,
    });

    if (factorsError) {
      return NextResponse.json({ error: factorsError.message }, { status: 400 });
    }

    // 2. Delete all enrolled factors for target user
    const factors = factorsData?.factors || [];
    for (const factor of factors) {
      await supabaseAdmin.auth.admin.mfa.deleteFactor({
        userId: targetUserId,
        id: factor.id,
      });
    }

    // 3. Clear recovery codes in profiles
    await supabaseAdmin
      .from('profiles')
      .update({ mfa_recovery_codes: [] })
      .eq('id', targetUserId);

    // 4. Log audit event
    await logAuditEvent({
      action: 'MFA_RESET',
      entityType: 'USER',
      entityId: targetUserId,
      actor: currentUser,
      metadata: { resetBy: currentUser.email, factorsRemoved: factors.length },
    });

    return NextResponse.json({
      success: true,
      message: `MFA reset successfully for user. Removed ${factors.length} factor(s).`,
      factorsRemoved: factors.length,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error during MFA reset.' },
      { status: 500 }
    );
  }
}
