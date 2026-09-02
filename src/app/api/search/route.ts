import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { ArticleItem, CaseStudyItem, BlogItem } from '@/types';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').trim();
  const type = searchParams.get('type') || 'all'; // 'all', 'articles', 'case-studies', 'blogs'

  if (!q) {
    return NextResponse.json({
      articles: [],
      caseStudies: [],
      blogs: [],
      total: 0,
    });
  }

  try {
    // 1. Search Articles
    const articlesPromise = (type === 'all' || type === 'articles')
      ? supabaseAdmin
          .from('articles')
          .select('*, category:categories(*), author:profiles(*)')
          .eq('status', 'PUBLISHED')
          .or(`title.ilike.%${q}%,summary.ilike.%${q}%,body.ilike.%${q}%,source_name.ilike.%${q}%`)
          .order('published_at', { ascending: false })
          .limit(15)
      : Promise.resolve({ data: [] });

    // 2. Search Case Studies
    const caseStudiesPromise = (type === 'all' || type === 'case-studies')
      ? supabaseAdmin
          .from('case_studies')
          .select('*, category:categories(*), author:profiles(*)')
          .eq('status', 'PUBLISHED')
          .or(`title.ilike.%${q}%,company.ilike.%${q}%,summary.ilike.%${q}%,strategy.ilike.%${q}%,body.ilike.%${q}%`)
          .order('published_at', { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] });

    // 3. Search Blogs
    const blogsPromise = (type === 'all' || type === 'blogs')
      ? supabaseAdmin
          .from('blog_posts')
          .select('*, category:categories(*), author:profiles(*)')
          .eq('status', 'PUBLISHED')
          .or(`title.ilike.%${q}%,excerpt.ilike.%${q}%,body.ilike.%${q}%`)
          .order('published_at', { ascending: false })
          .limit(10)
      : Promise.resolve({ data: [] });

    const [articlesRes, caseStudiesRes, blogsRes] = await Promise.all([
      articlesPromise,
      caseStudiesPromise,
      blogsPromise,
    ]);

    const articles: ArticleItem[] = (articlesRes.data || []).map(item => ({
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
      likeCount: item.like_count ?? 0,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));

    const caseStudies: CaseStudyItem[] = (caseStudiesRes.data || []).map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      company: item.company,
      companyLogo: item.company_logo,
      valuation: item.valuation,
      stage: item.stage,
      keyMetric: item.key_metric,
      summary: item.summary,
      challenge: item.challenge,
      strategy: item.strategy,
      outcome: item.outcome,
      body: item.body,
      coverImage: item.cover_image,
      categoryId: item.category_id,
      category: item.category,
      authorId: item.author_id,
      author: item.author,
      readTimeMinutes: item.read_time_minutes || 8,
      status: item.status,
      publishedAt: item.published_at ? new Date(item.published_at) : null,
      viewCount: item.view_count || 0,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));

    const blogs: BlogItem[] = (blogsRes.data || []).map(item => ({
      id: item.id,
      title: item.title,
      slug: item.slug,
      excerpt: item.excerpt,
      body: item.body,
      coverImage: item.cover_image,
      categoryId: item.category_id,
      category: item.category,
      authorId: item.author_id,
      author: item.author,
      readTimeMinutes: item.read_time_minutes || 4,
      status: item.status,
      publishedAt: item.published_at ? new Date(item.published_at) : null,
      viewCount: item.view_count || 0,
      createdAt: new Date(item.created_at),
      updatedAt: new Date(item.updated_at),
    }));

    const total = articles.length + caseStudies.length + blogs.length;

    return NextResponse.json({
      articles,
      caseStudies,
      blogs,
      total,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Search query failed' },
      { status: 500 }
    );
  }
}
