import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser, canEdit } from '@/lib/auth/staff';
import { generateRecoveryCodes } from '@/lib/auth/mfa';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canEdit(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Staff credentials required.' }, { status: 403 });
  }

  try {
    const supabase = createServerSupabaseClient();

    // 1. Enroll TOTP factor in Supabase Auth
    const { data: factorData, error: enrollError } = await supabase.auth.mfa.enroll({
      factorType: 'totp',
      friendlyName: `Venture Atlas (${user.email})`,
    });

    if (enrollError || !factorData) {
      return NextResponse.json(
        { error: enrollError?.message || 'Failed to initialize MFA enrollment.' },
        { status: 400 }
      );
    }

    // 2. Generate recovery codes & store hashes in profile
    const { plain, hashed } = generateRecoveryCodes(8);

    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ mfa_recovery_codes: hashed })
      .eq('id', user.id);

    if (profileError) {
      console.error('Failed to store recovery codes:', profileError.message);
    }

    await logAuditEvent({
      action: 'MFA_ENROLL_INITIATED',
      entityType: 'USER',
      entityId: user.id,
      actor: user,
      metadata: { factorId: factorData.id },
    });

    return NextResponse.json({
      factorId: factorData.id,
      qrCode: factorData.totp.qr_code,
      secret: factorData.totp.secret,
      uri: factorData.totp.uri,
      recoveryCodes: plain,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Internal server error during MFA enrollment' },
      { status: 500 }
    );
  }
}
