import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const response = NextResponse.json({ success: true, message: 'Signed out successfully.' });

  response.cookies.set('va_admin_session', '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  response.cookies.set('va_admin_token', '', {
    path: '/',
    maxAge: 0,
    sameSite: 'lax',
  });

  return response;
}
