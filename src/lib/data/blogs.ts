import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '../supabase/admin';
import { BlogItem } from '@/types';

function mapBlog(item: any): BlogItem {
  return {
    id: item.id,
    title: item.title,
    slug: item.slug,
    excerpt: item.excerpt,
    body: item.body,
    coverImage: item.cover_image,
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
    readTimeMinutes: item.read_time_minutes || 4,
    status: item.status,
    publishedAt: item.published_at ? new Date(item.published_at) : null,
    viewCount: item.view_count || 0,
    likeCount: item.like_count ?? 0,
    seoTitle: item.seo_title,
    seoDescription: item.seo_description,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  };
}

export async function fetchBlogs(limit = 10): Promise<BlogItem[]> {
  return unstable_cache(
    async () => {
      try {
        const { data, error } = await supabaseAdmin
          .from('blog_posts')
          .select('*, category:categories(*), author:profiles(*)')
          .eq('status', 'PUBLISHED')
          .order('published_at', { ascending: false })
          .limit(limit);

        if (error || !data) return [];
        return data.map(mapBlog);
      } catch {
        return [];
      }
    },
    ['blogs-list', `${limit}`],
    {
      tags: ['blogs'],
      revalidate: 3600,
    }
  )();
}

export async function fetchBlogBySlug(slug: string): Promise<BlogItem | null> {
  return unstable_cache(
    async (s: string) => {
      try {
        const { data, error } = await supabaseAdmin
          .from('blog_posts')
          .select('*, category:categories(*), author:profiles(*)')
          .eq('slug', s)
          .eq('status', 'PUBLISHED')
          .single();

        if (error || !data) return null;
        return mapBlog(data);
      } catch {
        return null;
      }
    },
    ['blog-by-slug', slug],
    {
      tags: ['blogs', `blog:${slug}`],
      revalidate: 3600,
    }
  )(slug);
}

export async function fetchAdminBlogs(limit = 50): Promise<BlogItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*, category:categories(*), author:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map(mapBlog);
  } catch {
    return [];
  }
}

export async function fetchBlogById(id: string): Promise<BlogItem | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*, category:categories(*), author:profiles(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapBlog(data);
  } catch {
    return null;
  }
}

