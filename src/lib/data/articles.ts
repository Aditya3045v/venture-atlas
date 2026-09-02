import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '../supabase/admin';
import { ArticleItem } from '@/types';

function mapArticle(item: any): ArticleItem {
  return {
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
    canvasData: item.canvas_data || undefined,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  };
}

export async function fetchArticles(options?: {
  categorySlug?: string;
  limit?: number;
  status?: string;
  featuredOnly?: boolean;
  trendingOnly?: boolean;
}): Promise<ArticleItem[]> {
  const limit = options?.limit || 16;
  const status = options?.status || 'PUBLISHED';
  const categorySlug = options?.categorySlug;
  const featuredOnly = !!options?.featuredOnly;
  const trendingOnly = !!options?.trendingOnly;

  return unstable_cache(
    async () => {
      try {
        let query = supabaseAdmin
          .from('articles')
          .select('*, category:categories(*), author:profiles(*)')
          .eq('status', status)
          .order('published_at', { ascending: false })
          .limit(limit);

        if (featuredOnly) query = query.eq('is_featured', true);
        if (trendingOnly) query = query.eq('is_trending', true);

        if (categorySlug && categorySlug !== 'all') {
          const { data: catData } = await supabaseAdmin
            .from('categories')
            .select('id')
            .eq('slug', categorySlug)
            .single();

          if (catData?.id) {
            query = query.eq('category_id', catData.id);
          }
        }

        const { data, error } = await query;
        if (error || !data) return [];
        return data.map(mapArticle);
      } catch {
        return [];
      }
    },
    ['articles-list', `${status}-${categorySlug || 'all'}-${limit}-${featuredOnly}-${trendingOnly}`],
    {
      tags: ['articles', ...(categorySlug ? [`category:${categorySlug}`] : [])],
      revalidate: 3600,
    }
  )();
}

export async function fetchArticleBySlug(slug: string): Promise<ArticleItem | null> {
  return unstable_cache(
    async (s: string) => {
      try {
        const { data, error } = await supabaseAdmin
          .from('articles')
          .select('*, category:categories(*), author:profiles(*)')
          .eq('slug', s)
          .eq('status', 'PUBLISHED')
          .single();

        if (error || !data) return null;
        return mapArticle(data);
      } catch {
        return null;
      }
    },
    ['article-by-slug', slug],
    {
      tags: ['articles', `article:${slug}`],
      revalidate: 3600,
    }
  )(slug);
}

export async function fetchAdminArticles(limit = 50): Promise<ArticleItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*, category:categories(*), author:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map(mapArticle);
  } catch {
    return [];
  }
}

export async function fetchArticleById(id: string): Promise<ArticleItem | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*, category:categories(*), author:profiles(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapArticle(data);
  } catch {
    return null;
  }
}


