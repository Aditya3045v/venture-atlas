import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/staff';
import { signStaffSession, STAFF_SESSION_COOKIE } from '@/lib/auth/staff-session';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    const staffSession = signStaffSession({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      plan: user.plan,
    });

    const response = NextResponse.json({
      user,
      authenticated: true,
      staffSession,
    });

    response.cookies.set(STAFF_SESSION_COOKIE, staffSession, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { user: null, authenticated: false, error: error?.message },
      { status: 500 }
    );
  }
}
