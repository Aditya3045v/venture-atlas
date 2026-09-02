import { NextRequest, NextResponse } from 'next/server';
import { getReader } from '@/lib/auth/reader';
import { getCurrentUser } from '@/lib/auth/staff';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const staffUser = await getCurrentUser();
    const reader = await getReader();

    if (!staffUser && !reader) {
      return NextResponse.json({ bookmarks: [], isAnonymous: true });
    }

    let query = supabaseAdmin
      .from('bookmarks')
      .select('article_id, created_at, article:articles(*, category:categories(*))')
      .order('created_at', { ascending: false });

    if (staffUser) {
      query = query.eq('profile_id', staffUser.id);
    } else if (reader) {
      query = query.eq('reader_id', reader.readerId);
    }

    const { data, error } = await query;
    if (error) {
      return NextResponse.json({ bookmarks: [], error: error.message });
    }

    const bookmarks = (data || []).map(b => ({
      articleId: b.article_id,
      createdAt: b.created_at,
      article: b.article,
    }));

    return NextResponse.json({ bookmarks, isAnonymous: false });
  } catch (error: any) {
    return NextResponse.json({ bookmarks: [], error: error?.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const staffUser = await getCurrentUser();
    const reader = await getReader();

    if (!staffUser && !reader) {
      return NextResponse.json(
        { error: 'Reader registration required to bookmark articles.', requiresAuth: true },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { articleId, saved = true } = body;

    if (!articleId) {
      return NextResponse.json({ error: 'articleId is required.' }, { status: 400 });
    }

    if (saved) {
      const { error: insertErr } = await supabaseAdmin
        .from('bookmarks')
        .insert({
          article_id: articleId,
          profile_id: staffUser?.id || null,
          reader_id: reader?.readerId || null,
        });

      if (insertErr && !insertErr.message?.includes('duplicate key') && !insertErr.message?.includes('unique')) {
        console.warn('Database bookmark insert warning:', insertErr.message);
      }
    } else {
      let deleteQuery = supabaseAdmin.from('bookmarks').delete().eq('article_id', articleId);
      if (staffUser) {
        deleteQuery = deleteQuery.eq('profile_id', staffUser.id);
      } else if (reader) {
        deleteQuery = deleteQuery.eq('reader_id', reader.readerId);
      }
      await deleteQuery;
    }

    return NextResponse.json({
      success: true,
      articleId,
      saved,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Bookmark update failed' }, { status: 500 });
  }
}
