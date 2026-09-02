import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '../supabase/admin';
import { CaseStudyItem } from '@/types';

function mapCaseStudy(item: any): CaseStudyItem {
  return {
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
    readTimeMinutes: item.read_time_minutes || 8,
    status: item.status,
    publishedAt: item.published_at ? new Date(item.published_at) : null,
    viewCount: item.view_count || 0,
    likeCount: item.like_count ?? 0,
    createdAt: new Date(item.created_at),
    updatedAt: new Date(item.updated_at),
  };
}

export async function fetchCaseStudies(limit = 10): Promise<CaseStudyItem[]> {
  return unstable_cache(
    async () => {
      try {
        const { data, error } = await supabaseAdmin
          .from('case_studies')
          .select('*, category:categories(*), author:profiles(*)')
          .eq('status', 'PUBLISHED')
          .order('published_at', { ascending: false })
          .limit(limit);

        if (error || !data) return [];
        return data.map(mapCaseStudy);
      } catch {
        return [];
      }
    },
    ['case-studies-list', `${limit}`],
    {
      tags: ['case-studies'],
      revalidate: 3600,
    }
  )();
}

export async function fetchCaseStudyBySlug(slug: string): Promise<CaseStudyItem | null> {
  return unstable_cache(
    async (s: string) => {
      try {
        const { data, error } = await supabaseAdmin
          .from('case_studies')
          .select('*, category:categories(*), author:profiles(*)')
          .eq('slug', s)
          .eq('status', 'PUBLISHED')
          .single();

        if (error || !data) return null;
        return mapCaseStudy(data);
      } catch {
        return null;
      }
    },
    ['case-study-by-slug', slug],
    {
      tags: ['case-studies', `case-study:${slug}`],
      revalidate: 3600,
    }
  )(slug);
}

export async function fetchAdminCaseStudies(limit = 50): Promise<CaseStudyItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('case_studies')
      .select('*, category:categories(*), author:profiles(*)')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data.map(mapCaseStudy);
  } catch {
    return [];
  }
}

export async function fetchCaseStudyById(id: string): Promise<CaseStudyItem | null> {
  try {
    const { data, error } = await supabaseAdmin
      .from('case_studies')
      .select('*, category:categories(*), author:profiles(*)')
      .eq('id', id)
      .single();

    if (error || !data) return null;
    return mapCaseStudy(data);
  } catch {
    return null;
  }
}

