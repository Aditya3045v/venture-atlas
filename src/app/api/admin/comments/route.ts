import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser, canModerate } from '@/lib/auth/staff';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canModerate(user.role)) {
    return NextResponse.json(
      { error: 'Unauthorized: Editor or Admin privileges required for comment moderation.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || 'ALL';

  try {
    let query = supabaseAdmin
      .from('comments')
      .select('*')
      .order('created_at', { ascending: false });

    if (status !== 'ALL') {
      query = query.eq('status', status);
    }

    const { data: comments, error } = await query;

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({ comments: comments || [] });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}
