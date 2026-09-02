import { NextRequest, NextResponse } from 'next/server';
import { getReader } from '@/lib/auth/reader';
import { getCurrentUser } from '@/lib/auth/staff';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { checkRateLimit } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const targetId = searchParams.get('articleId') || searchParams.get('entityId');

  if (!targetId) {
    return NextResponse.json({ error: 'entityId or articleId is required' }, { status: 400 });
  }

  const { data: comments, error } = await supabaseAdmin
    .from('comments')
    .select('id, user_name, body, created_at, status')
    .eq('entity_id', targetId)
    .eq('status', 'APPROVED')
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ comments: comments || [] });
}

export async function POST(req: NextRequest) {
  const isDev = process.env.NODE_ENV !== 'production';
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  
  if (!isDev && ip !== '127.0.0.1' && ip !== '::1') {
    const rateLimit = checkRateLimit(`comments:${ip}`, { windowMs: 3600 * 1000, maxRequests: 30 });
    if (!rateLimit.success) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please wait before submitting more comments.' },
        { status: 429 }
      );
    }
  }

  try {
    const body = await req.json().catch(() => ({}));
    const { entityId, articleId, comment } = body;
    const targetId = entityId || articleId;

    if (!targetId || !comment || typeof comment !== 'string' || !comment.trim()) {
      return NextResponse.json(
        { error: 'Valid entity ID and comment content are required.' },
        { status: 400 }
      );
    }

    const trimmedComment = comment.trim();
    if (trimmedComment.length > 2000) {
      return NextResponse.json(
        { error: 'Comment must not exceed 2,000 characters.' },
        { status: 400 }
      );
    }

    const staffUser = await getCurrentUser();
    const reader = await getReader();

    if (!staffUser && !reader) {
      return NextResponse.json(
        { error: 'Reader registration required to submit comments.' },
        { status: 401 }
      );
    }

    let commentPayload: any;

    if (staffUser) {
      commentPayload = {
        entity_id: targetId,
        entity_type: 'ARTICLE',
        profile_id: staffUser.id,
        user_email: staffUser.email,
        user_name: staffUser.name,
        body: trimmedComment,
        status: staffUser.role === 'ADMIN' || staffUser.role === 'EDITOR' ? 'APPROVED' : 'PENDING',
      };
    } else if (reader) {
      const emailLocalPart = reader.email.split('@')[0];
      commentPayload = {
        entity_id: targetId,
        entity_type: 'ARTICLE',
        profile_id: null,
        reader_id: reader.readerId,
        user_email: reader.email,
        user_name: `${emailLocalPart} (verified reader)`,
        body: trimmedComment,
        status: 'PENDING',
      };
    }

    const { data: inserted, error } = await supabaseAdmin
      .from('comments')
      .insert(commentPayload)
      .select()
      .single();

    if (error) {
      console.error('Database comment insert failure:', error.message);
      return NextResponse.json(
        { error: 'Database error: failed to submit comment.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Submitted for editorial review.',
      status: inserted?.status || 'PENDING',
      comment: inserted,
    });
  } catch (error: any) {
    console.error('Comment API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to submit comment for review.' },
      { status: 500 }
    );
  }
}
