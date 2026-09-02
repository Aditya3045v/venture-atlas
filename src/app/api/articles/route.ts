import { NextRequest, NextResponse } from 'next/server';
import { articleSchema } from '@/lib/validation';
import { getCurrentUser, canEdit, canPublish } from '@/lib/auth/staff';
import { logAuditEvent } from '@/lib/audit';
import { slugify, countWords } from '@/lib/sanitize';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { ArticleItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const all = searchParams.get('all') === 'true';
  const statusParam = searchParams.get('status');
  const limitParam = parseInt(searchParams.get('limit') || '10', 10);
  const limit = Math.min(Math.max(1, limitParam), 50);
  const cursorPublishedAt = searchParams.get('cursor_published_at');
  const cursorId = searchParams.get('cursor_id');

  try {
    const supabase = createServerSupabaseClient();
    const staffUser = await getCurrentUser();

    let query = supabase
      .from('articles')
      .select('*, category:categories(*), author:profiles(*)')
      .order('published_at', { ascending: false })
      .limit(limit + 1);

    // Non-staff users can NEVER see non-published articles
    if (!staffUser || !canEdit(staffUser.role)) {
      query = query.eq('status', 'PUBLISHED');
    } else {
      if (statusParam) {
        query = query.eq('status', statusParam);
      } else if (!all) {
        query = query.eq('status', 'PUBLISHED');
      }
    }

    if (category && category !== 'all') {
      const { data: catData } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', category)
        .single();

      if (catData?.id) {
        query = query.eq('category_id', catData.id);
      }
    }

    if (cursorPublishedAt && cursorId) {
      query = query.or(`published_at.lt.${cursorPublishedAt},and(published_at.eq.${cursorPublishedAt},id.lt.${cursorId})`);
    }

    const { data: rawArticles, error } = await query;

    if (error || !rawArticles) {
      return NextResponse.json({
        articles: [],
        nextCursor: null,
        hasMore: false,
      });
    }

    const hasMore = rawArticles.length > limit;
    const items = hasMore ? rawArticles.slice(0, limit) : rawArticles;

    const formattedArticles: ArticleItem[] = items.map(item => ({
      id: item.id,
      type: item.type || 'NEWS',
      title: item.title,
      slug: item.slug,
      summary: item.summary,
      body: item.body,
      sourceName: item.source_name,
      sourceUrl: item.source_url,
      sourceAuthor: item.source_author,
      authorName: item.source_author || item.author?.name || 'Staff Reporter',
      authorRole: item.author?.role || 'Senior Venture Reporter',
      categoryId: item.category_id,
      category: item.category
        ? {
            id: item.category.id,
            name: item.category.name,
            slug: item.category.slug,
            description: item.category.description,
            color: item.category.color,
            order: item.category.display_order ?? item.category.order ?? 0,
          }
        : undefined,
      authorId: item.author_id,
      author: item.author
        ? {
            id: item.author.id,
            email: item.author.email,
            name: item.author.name,
            role: item.author.role,
            avatar: item.author.avatar,
            plan: item.author.plan || 'FREE',
            mfaEnabled: false,
            bio: item.author.bio,
          }
        : null,
      coverImage: item.cover_image,
      photoCredit: item.photo_credit,
      readTimeMinutes: item.read_time_minutes || 1,
      wordCount: item.word_count || 60,
      status: item.status,
      isFeatured: item.is_featured,
      isTrending: item.is_trending,
      publishedAt: item.published_at ? new Date(item.published_at) : null,
      viewCount: item.view_count || 0,
      likeCount: item.like_count ?? 0,
      seoTitle: item.seo_title,
      seoDescription: item.seo_description,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));

    const lastItem = formattedArticles[formattedArticles.length - 1];
    const nextCursor = hasMore && lastItem ? {
      publishedAt: lastItem.publishedAt ? new Date(lastItem.publishedAt).toISOString() : new Date().toISOString(),
      id: lastItem.id,
    } : null;

    return NextResponse.json({
      articles: formattedArticles,
      nextCursor,
      hasMore,
    });
  } catch (error: any) {
    return NextResponse.json({
      articles: [],
      nextCursor: null,
      hasMore: false,
      error: error?.message,
    }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || !canEdit(user.role)) {
    return NextResponse.json({ error: 'Unauthorized: Staff credentials required.' }, { status: 403 });
  }

  try {
    const json = await req.json();
    const validated = articleSchema.parse(json);

    // Permission enforcement: WRITER cannot publish directly
    if (user.role === 'WRITER' && validated.status === 'PUBLISHED') {
      return NextResponse.json(
        { error: 'PERMISSION_DENIED: Writers cannot publish directly; submit as DRAFT or IN_REVIEW for editorial approval.' },
        { status: 403 }
      );
    }

    const slug = slugify(validated.title);
    const words = countWords(validated.summary);

    const insertPayload = {
      title: validated.title,
      slug,
      summary: validated.summary,
      body: validated.body,
      category_id: validated.categoryId,
      author_id: user.id,
      source_name: validated.sourceName || null,
      source_url: validated.sourceUrl || null,
      source_author: validated.authorName || validated.sourceAuthor || user.name,
      cover_image: validated.coverImage || null,
      photo_credit: validated.photoCredit || null,
      word_count: words,
      read_time_minutes: Math.max(1, Math.ceil(words / 40)),
      status: validated.status as any,
      is_featured: validated.isFeatured || false,
      is_trending: validated.isTrending || false,
      scheduled_for: validated.scheduledFor ? new Date(validated.scheduledFor).toISOString() : null,
      published_at: validated.status === 'PUBLISHED' ? new Date().toISOString() : null,
      seo_title: validated.seoTitle || null,
      seo_description: validated.seoDescription || null,
      canvas_data: validated.canvasData || null,
    };

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase
      .from('articles')
      .insert(insertPayload)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    await logAuditEvent({
      action: validated.status === 'PUBLISHED' ? 'PUBLISH_ARTICLE' : 'CREATE_ARTICLE',
      entityType: 'ARTICLE',
      entityId: data.id,
      actor: user,
      metadata: { title: validated.title, status: validated.status, slug },
    });

    return NextResponse.json({ article: data }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Invalid article payload' },
      { status: 400 }
    );
  }
}
