import { supabaseAdmin } from './supabase/admin';
import { prisma, ensureDatabaseSeeded } from './db';
import { ArticleItem, CategoryItem, BlogItem, CaseStudyItem } from '@/types';

/**
 * Venture Atlas Unified Supabase Data Layer
 * Uses Supabase cloud as the primary backend with local caching & Prisma fallback.
 */

export async function fetchCategories(): Promise<CategoryItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('categories')
      .select('*')
      .order('order', { ascending: true });

    if (!error && data && data.length > 0) {
      return data as CategoryItem[];
    }
  } catch (err) {
    console.warn('Supabase categories fetch fallback to Prisma:', err);
  }

  await ensureDatabaseSeeded();
  return (await prisma.category.findMany({
    orderBy: { order: 'asc' },
  })) as CategoryItem[];
}

export async function fetchArticles(options?: {
  categorySlug?: string;
  limit?: number;
  status?: string;
  featuredOnly?: boolean;
}): Promise<ArticleItem[]> {
  const limit = options?.limit || 12;
  const status = options?.status || 'PUBLISHED';

  try {
    let query = supabaseAdmin
      .from('articles')
      .select('*, category:categories(*), author:users(*)')
      .eq('status', status)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (options?.featuredOnly) {
      query = query.eq('is_featured', true);
    }

    const { data, error } = await query;
    if (!error && data && data.length > 0) {
      return data.map(item => ({
        id: item.id,
        type: item.type || 'NEWS',
        title: item.title,
        slug: item.slug,
        summary: item.summary,
        body: item.body,
        sourceName: item.source_name,
        sourceUrl: item.source_url,
        sourceAuthor: item.source_author,
        categoryId: item.category_id,
        category: item.category,
        authorId: item.author_id,
        author: item.author,
        coverImage: item.cover_image,
        photoCredit: item.photo_credit,
        readTimeMinutes: item.read_time_minutes || 1,
        wordCount: item.word_count || 60,
        status: item.status,
        isFeatured: item.is_featured,
        isTrending: item.is_trending,
        publishedAt: item.published_at ? new Date(item.published_at) : null,
        viewCount: item.view_count || 0,
        seoTitle: item.seo_title,
        seoDescription: item.seo_description,
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at),
      })) as unknown as ArticleItem[];
    }
  } catch (err) {
    console.warn('Supabase articles fetch fallback to Prisma:', err);
  }

  await ensureDatabaseSeeded();
  return (await prisma.article.findMany({
    where: {
      status: options?.status ? options.status : 'PUBLISHED',
      ...(options?.featuredOnly ? { isFeatured: true } : {}),
      ...(options?.categorySlug && options.categorySlug !== 'all'
        ? { category: { slug: options.categorySlug } }
        : {}),
    },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  })) as unknown as ArticleItem[];
}

export async function fetchArticleBySlug(slug: string): Promise<ArticleItem | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('articles')
      .select('*, category:categories(*), author:users(*)')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return {
        id: data.id,
        type: data.type || 'NEWS',
        title: data.title,
        slug: data.slug,
        summary: data.summary,
        body: data.body,
        sourceName: data.source_name,
        sourceUrl: data.source_url,
        sourceAuthor: data.source_author,
        categoryId: data.category_id,
        category: data.category,
        authorId: data.author_id,
        author: data.author,
        coverImage: data.cover_image,
        photoCredit: data.photo_credit,
        readTimeMinutes: data.read_time_minutes || 1,
        wordCount: data.word_count || 60,
        status: data.status,
        isFeatured: data.is_featured,
        isTrending: data.is_trending,
        publishedAt: data.published_at ? new Date(data.published_at) : null,
        viewCount: data.view_count || 0,
        seoTitle: data.seo_title,
        seoDescription: data.seo_description,
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at),
      } as unknown as ArticleItem;
    }
  } catch (err) {
    console.warn('Supabase article by slug fallback:', err);
  }

  await ensureDatabaseSeeded();
  return (await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
    },
  })) as unknown as ArticleItem | null;
}

export async function fetchCaseStudies(limit = 10): Promise<CaseStudyItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('case_studies')
      .select('*, category:categories(*), author:users(*)')
      .eq('status', 'PUBLISHED')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data as unknown as CaseStudyItem[];
    }
  } catch (err) {
    console.warn('Supabase case studies fallback:', err);
  }

  await ensureDatabaseSeeded();
  return (await prisma.caseStudy.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      category: true,
      author: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  })) as unknown as CaseStudyItem[];
}

export async function fetchCaseStudyBySlug(slug: string): Promise<CaseStudyItem | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('case_studies')
      .select('*, category:categories(*), author:users(*)')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return data as unknown as CaseStudyItem;
    }
  } catch (err) {
    console.warn('Supabase case study by slug fallback:', err);
  }

  await ensureDatabaseSeeded();
  return (await prisma.caseStudy.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
    },
  })) as unknown as CaseStudyItem | null;
}

export async function fetchBlogs(limit = 10): Promise<BlogItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*, category:categories(*), author:users(*)')
      .eq('status', 'PUBLISHED')
      .order('published_at', { ascending: false })
      .limit(limit);

    if (!error && data && data.length > 0) {
      return data as unknown as BlogItem[];
    }
  } catch (err) {
    console.warn('Supabase blogs fallback:', err);
  }

  await ensureDatabaseSeeded();
  return (await prisma.blogPost.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      category: true,
      author: true,
    },
    orderBy: { publishedAt: 'desc' },
    take: limit,
  })) as unknown as BlogItem[];
}

export async function fetchBlogBySlug(slug: string): Promise<BlogItem | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('blog_posts')
      .select('*, category:categories(*), author:users(*)')
      .eq('slug', slug)
      .single();

    if (!error && data) {
      return data as unknown as BlogItem;
    }
  } catch (err) {
    console.warn('Supabase blog by slug fallback:', err);
  }

  await ensureDatabaseSeeded();
  return (await prisma.blogPost.findUnique({
    where: { slug },
    include: {
      category: true,
      author: true,
    },
  })) as unknown as BlogItem | null;
}
