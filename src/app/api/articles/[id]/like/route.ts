import { NextRequest, NextResponse } from 'next/server';
import { getReader } from '@/lib/auth/reader';
import { getCurrentUser } from '@/lib/auth/staff';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const body = await req.json().catch(() => ({}));
    const { liked = true } = body;

    const staffUser = await getCurrentUser();
    const reader = await getReader();

    if (!staffUser && !reader) {
      return NextResponse.json(
        { error: 'Reader registration required to like articles.', requiresAuth: true },
        { status: 401 }
      );
    }

    // Resolve article UUID
    let articleQuery = supabaseAdmin.from('articles').select('id, like_count');
    if (id.includes('-') && id.length === 36) {
      articleQuery = articleQuery.eq('id', id);
    } else {
      articleQuery = articleQuery.eq('slug', id);
    }

    const { data: article, error: articleErr } = await articleQuery.single();
    if (articleErr || !article) {
      return NextResponse.json({ error: 'Article not found.' }, { status: 404 });
    }

    const articleId = article.id;
    const readerId = reader?.readerId || null;
    const profileId = staffUser?.id || null;

    if (liked) {
      const { error: insertErr } = await supabaseAdmin
        .from('likes')
        .insert({
          article_id: articleId,
          reader_id: readerId,
          profile_id: profileId,
        });

      if (insertErr && !insertErr.message?.includes('duplicate key') && !insertErr.message?.includes('unique')) {
        console.warn('Database like insert warning:', insertErr.message);
      }
    } else {
      let deleteQuery = supabaseAdmin.from('likes').delete().eq('article_id', articleId);
      if (staffUser) {
        deleteQuery = deleteQuery.eq('profile_id', profileId);
      } else if (reader) {
        deleteQuery = deleteQuery.eq('reader_id', readerId);
      }
      await deleteQuery;
    }

    // Query fresh like count
    const { count } = await supabaseAdmin
      .from('likes')
      .select('*', { count: 'exact', head: true })
      .eq('article_id', articleId);

    const calculatedCount = count ?? (liked ? 1 : 0);

    // Sync like count to articles table
    await supabaseAdmin
      .from('articles')
      .update({ like_count: calculatedCount })
      .eq('id', articleId);

    return NextResponse.json({
      success: true,
      articleId,
      liked,
      likeCount: calculatedCount,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Like interaction failed' }, { status: 500 });
  }
}
