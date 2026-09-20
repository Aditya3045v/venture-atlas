import { NextRequest, NextResponse } from 'next/server';
import { getCurrentUser } from '@/lib/auth/staff';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ user: null, authenticated: false });
    }

    return NextResponse.json({
      user,
      authenticated: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { user: null, authenticated: false, error: error?.message },
      { status: 500 }
    );
  }
}
