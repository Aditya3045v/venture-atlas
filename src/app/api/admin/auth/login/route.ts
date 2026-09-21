import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';
import { signStaffSession, STAFF_SESSION_COOKIE } from '@/lib/auth/staff-session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Please enter both email and access key.' },
        { status: 400 }
      );
    }

    const cleanEmail = String(email).trim().toLowerCase();

    // 1. Authenticate against Supabase Auth via server-side admin client
    // This runs in the server/cloud environment (Vercel) where Supabase DNS is never blocked by local ISPs.
    const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
      email: cleanEmail,
      password: String(password),
    });

    if (authError || !authData.user || !authData.session) {
      return NextResponse.json(
        { error: 'Invalid login credentials or clearance rejected.' },
        { status: 401 }
      );
    }

    const isOwner = cleanEmail === 'admin@ventureatlas.in';

    // 2. Query user profile to verify active status & editorial role
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('role, is_active, name')
      .eq('id', authData.user.id)
      .maybeSingle();

    if (profile?.is_active === false && !isOwner) {
      return NextResponse.json(
        { error: 'This account has been deactivated. Please contact the administrator.' },
        { status: 403 }
      );
    }

    const userRole = isOwner
      ? 'SUPER_ADMIN'
      : (profile?.role || authData.user.user_metadata?.role || 'WRITER');

    const isAuthorized = isOwner || !['READER', 'USER'].includes(userRole);
    if (!isAuthorized) {
      return NextResponse.json(
        { error: 'This account does not have editorial clearance.' },
        { status: 403 }
      );
    }

    const userName = profile?.name || authData.user.user_metadata?.name || (isOwner ? 'Venture Atlas Super Admin' : 'Staff Member');

    const staffUser = {
      id: authData.user.id,
      email: cleanEmail,
      name: userName,
      role: userRole,
      avatar: null,
      plan: 'ENTERPRISE',
      bio: null,
      is_active: true,
      mfaEnabled: false,
    };

    const staffSessionToken = signStaffSession(staffUser as any);

    // 3. Prepare response and set secure session cookies
    const response = NextResponse.json({
      success: true,
      user: staffUser,
      token: authData.session.access_token,
      staffSession: staffSessionToken,
      expiresAt: authData.session.expires_at,
    });

    // 30-day persistent admin session cookie
    response.cookies.set('va_admin_session', '1', {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false,
    });

    // 30-day explicit admin access token cookie
    response.cookies.set('va_admin_token', authData.session.access_token, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false,
    });

    // 30-day HMAC-signed staff session cookie
    response.cookies.set(STAFF_SESSION_COOKIE, staffSessionToken, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false,
    });

    try {
      await logAuditEvent({
        actor: {
          id: authData.user.id,
          email: cleanEmail,
          role: userRole as any,
          name: userName,
          plan: 'ENTERPRISE',
          avatar: null,
          bio: null,
          is_active: true,
          mfaEnabled: false,
        },
        action: 'ADMIN_LOGIN_SUCCESS',
        entityType: 'AUTH',
        entityId: authData.user.id,
        metadata: { client: req.headers.get('user-agent') },
      });
    } catch {}

    return response;
  } catch (error: any) {
    console.error('[Admin Auth Login Error]:', error);
    return NextResponse.json(
      { error: error?.message || 'An authentication error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
