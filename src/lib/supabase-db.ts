import { supabaseAdmin } from './supabase/admin';
import { prisma, ensureDatabaseSeeded } from './db';
import { ArticleItem, CategoryItem, BlogItem, CaseStudyItem } from '@/types';
import { SEED_CATEGORIES, SEED_ARTICLES, SEED_BLOGS, SEED_CASE_STUDIES } from '@/data/seedData';

/**
 * Venture Atlas Unified Supabase Data Layer
 * Uses Supabase cloud as the primary backend with local caching, Prisma, & SeedData fallback.
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
    console.warn('Supabase categories fetch fallback:', err);
  }

  try {
    await ensureDatabaseSeeded();
    const local = await prisma.category.findMany({
      orderBy: { order: 'asc' },
    });
    if (local && local.length > 0) {
      return local as CategoryItem[];
    }
  } catch (err) {
    console.warn('Prisma categories fallback:', err);
  }

  return SEED_CATEGORIES.map((c, i) => ({
    id: `seed-cat-${i + 1}`,
    name: c.name,
    slug: c.slug,
    description: c.description,
    color: c.color,
    order: c.order,
    createdAt: new Date(),
    updatedAt: new Date(),
  })) as unknown as CategoryItem[];
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
    console.warn('Supabase articles fetch fallback:', err);
  }

  try {
    await ensureDatabaseSeeded();
    const local = await prisma.article.findMany({
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
    });
    if (local && local.length > 0) {
      return local as unknown as ArticleItem[];
    }
  } catch (err) {
    console.warn('Prisma articles fallback:', err);
  }

  let seedFiltered = SEED_ARTICLES.filter(a => a.status === status);
  if (options?.featuredOnly) {
    seedFiltered = seedFiltered.filter(a => a.isFeatured);
  }
  if (options?.categorySlug && options.categorySlug !== 'all') {
    seedFiltered = seedFiltered.filter(a => a.categorySlug === options.categorySlug);
  }

  return seedFiltered.slice(0, limit).map((a, i) => ({
    id: `seed-art-${i + 1}`,
    type: 'NEWS',
    title: a.title,
    slug: a.slug,
    summary: a.summary,
    body: a.body,
    sourceName: a.sourceName,
    sourceUrl: a.sourceUrl,
    sourceAuthor: a.sourceAuthor,
    categoryId: `seed-cat-${a.categorySlug}`,
    category: {
      id: `seed-cat-${a.categorySlug}`,
      name: a.categorySlug.toUpperCase(),
      slug: a.categorySlug,
      color: '#3B82F6',
      description: '',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    authorId: 'seed-admin',
    author: {
      id: 'seed-admin',
      email: 'admin@ventureatlas.io',
      name: 'Venture Atlas Editorial',
      role: 'ADMIN',
      plan: 'ENTERPRISE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    coverImage: a.coverImage,
    photoCredit: a.photoCredit,
    readTimeMinutes: a.readTimeMinutes,
    wordCount: a.wordCount,
    status: a.status,
    isFeatured: a.isFeatured,
    isTrending: a.isTrending,
    publishedAt: new Date(a.publishedAt),
    viewCount: a.viewCount,
    createdAt: new Date(),
    updatedAt: new Date(),
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

  try {
    await ensureDatabaseSeeded();
    const local = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
        tags: { include: { tag: true } },
      },
    });
    if (local) return local as unknown as ArticleItem;
  } catch (err) {
    console.warn('Prisma article by slug fallback:', err);
  }

  const found = SEED_ARTICLES.find(a => a.slug === slug);
  if (!found) return null;

  return {
    id: `seed-art-${slug}`,
    type: 'NEWS',
    title: found.title,
    slug: found.slug,
    summary: found.summary,
    body: found.body,
    sourceName: found.sourceName,
    sourceUrl: found.sourceUrl,
    sourceAuthor: found.sourceAuthor,
    categoryId: `seed-cat-${found.categorySlug}`,
    category: {
      id: `seed-cat-${found.categorySlug}`,
      name: found.categorySlug.toUpperCase(),
      slug: found.categorySlug,
      color: '#3B82F6',
      description: '',
      order: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
    },
    authorId: 'seed-admin',
    author: {
      id: 'seed-admin',
      email: 'admin@ventureatlas.io',
      name: 'Venture Atlas Editorial',
      role: 'ADMIN',
      plan: 'ENTERPRISE',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
    },
    coverImage: found.coverImage,
    photoCredit: found.photoCredit,
    readTimeMinutes: found.readTimeMinutes,
    wordCount: found.wordCount,
    status: found.status,
    isFeatured: found.isFeatured,
    isTrending: found.isTrending,
    publishedAt: new Date(found.publishedAt),
    viewCount: found.viewCount,
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as ArticleItem;
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

  try {
    await ensureDatabaseSeeded();
    const local = await prisma.caseStudy.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: true,
        author: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    if (local && local.length > 0) return local as unknown as CaseStudyItem[];
  } catch (err) {
    console.warn('Prisma case studies fallback:', err);
  }

  return SEED_CASE_STUDIES.slice(0, limit).map((cs, i) => ({
    id: `seed-cs-${i + 1}`,
    title: cs.title,
    slug: cs.slug,
    company: cs.company,
    companyLogo: cs.companyLogo,
    valuation: cs.valuation,
    stage: cs.stage,
    keyMetric: cs.keyMetric,
    summary: cs.summary,
    challenge: cs.challenge,
    strategy: cs.strategy,
    outcome: cs.outcome,
    body: cs.body,
    coverImage: cs.coverImage,
    categoryId: 'seed-cat-cs',
    authorId: 'seed-admin',
    readTimeMinutes: cs.readTimeMinutes,
    status: cs.status,
    publishedAt: new Date(cs.publishedAt),
    createdAt: new Date(),
    updatedAt: new Date(),
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

  try {
    await ensureDatabaseSeeded();
    const local = await prisma.caseStudy.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
      },
    });
    if (local) return local as unknown as CaseStudyItem;
  } catch (err) {
    console.warn('Prisma case study by slug fallback:', err);
  }

  const found = SEED_CASE_STUDIES.find(cs => cs.slug === slug);
  if (!found) return null;

  return {
    id: `seed-cs-${slug}`,
    title: found.title,
    slug: found.slug,
    company: found.company,
    companyLogo: found.companyLogo,
    valuation: found.valuation,
    stage: found.stage,
    keyMetric: found.keyMetric,
    summary: found.summary,
    challenge: found.challenge,
    strategy: found.strategy,
    outcome: found.outcome,
    body: found.body,
    coverImage: found.coverImage,
    categoryId: 'seed-cat-cs',
    authorId: 'seed-admin',
    readTimeMinutes: found.readTimeMinutes,
    status: found.status,
    publishedAt: new Date(found.publishedAt),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as CaseStudyItem;
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

  try {
    await ensureDatabaseSeeded();
    const local = await prisma.blogPost.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: true,
        author: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: limit,
    });
    if (local && local.length > 0) return local as unknown as BlogItem[];
  } catch (err) {
    console.warn('Prisma blogs fallback:', err);
  }

  return SEED_BLOGS.slice(0, limit).map((b, i) => ({
    id: `seed-blog-${i + 1}`,
    title: b.title,
    slug: b.slug,
    excerpt: b.excerpt,
    body: b.body,
    coverImage: b.coverImage,
    authorId: 'seed-admin',
    categoryId: 'seed-cat-blog',
    readTimeMinutes: b.readTimeMinutes,
    status: b.status,
    publishedAt: new Date(b.publishedAt),
    createdAt: new Date(),
    updatedAt: new Date(),
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

  try {
    await ensureDatabaseSeeded();
    const local = await prisma.blogPost.findUnique({
      where: { slug },
      include: {
        category: true,
        author: true,
      },
    });
    if (local) return local as unknown as BlogItem;
  } catch (err) {
    console.warn('Prisma blog by slug fallback:', err);
  }

  const found = SEED_BLOGS.find(b => b.slug === slug);
  if (!found) return null;

  return {
    id: `seed-blog-${slug}`,
    title: found.title,
    slug: found.slug,
    excerpt: found.excerpt,
    body: found.body,
    coverImage: found.coverImage,
    authorId: 'seed-admin',
    categoryId: 'seed-cat-blog',
    readTimeMinutes: found.readTimeMinutes,
    status: found.status,
    publishedAt: new Date(found.publishedAt),
    createdAt: new Date(),
    updatedAt: new Date(),
  } as unknown as BlogItem;
}
