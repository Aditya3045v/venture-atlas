import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser, canEdit } from '@/lib/auth/staff';
import { hashRecoveryCode } from '@/lib/auth/mfa';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { factorId, code, recoveryCode } = body;

    const supabase = createServerSupabaseClient();
    const { data: { user: authUser } } = await supabase.auth.getUser();

    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized: Session required.' }, { status: 401 });
    }

    // 1. Regular TOTP Challenge Verification
    if (code && factorId) {
      const { data, error } = await supabase.auth.mfa.challengeAndVerify({
        factorId,
        code: code.trim(),
      });

      if (error || !data) {
        return NextResponse.json(
          { error: error?.message || 'Invalid authenticator code.' },
          { status: 400 }
        );
      }

      await logAuditEvent({
        action: 'MFA_CHALLENGE_SUCCESS',
        entityType: 'USER',
        entityId: authUser.id,
        actor: { id: authUser.id, email: authUser.email || '', role: 'EDITOR' } as any,
        metadata: { factorId, method: 'totp' },
      });

      return NextResponse.json({ success: true, aal: 'aal2' });
    }

    // 2. Recovery Code Fallback
    if (recoveryCode) {
      const { data: profile } = await supabaseAdmin
        .from('profiles')
        .select('id, email, role, mfa_recovery_codes')
        .eq('id', authUser.id)
        .single();

      const hashedInput = hashRecoveryCode(recoveryCode);
      const codes: string[] = profile?.mfa_recovery_codes || [];

      if (!codes.includes(hashedInput)) {
        return NextResponse.json({ error: 'Invalid recovery code.' }, { status: 400 });
      }

      // Consume the used recovery code
      const remainingCodes = codes.filter((c: string) => c !== hashedInput);
      await supabaseAdmin
        .from('profiles')
        .update({ mfa_recovery_codes: remainingCodes })
        .eq('id', authUser.id);

      await logAuditEvent({
        action: 'MFA_RECOVERY_CODE_USED',
        entityType: 'USER',
        entityId: authUser.id,
        actor: { id: authUser.id, email: authUser.email || '', role: profile?.role || 'EDITOR' } as any,
        metadata: { remainingCount: remainingCodes.length },
      });

      return NextResponse.json({ success: true, recovery: true, remainingCodesCount: remainingCodes.length });
    }

    return NextResponse.json(
      { error: 'Either TOTP code and factorId or recoveryCode is required.' },
      { status: 400 }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error during MFA challenge' },
      { status: 500 }
    );
  }
}
