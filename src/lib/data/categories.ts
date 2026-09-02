import { unstable_cache } from 'next/cache';
import { supabaseAdmin } from '../supabase/admin';
import { CategoryItem } from '@/types';

export async function fetchCategories(): Promise<CategoryItem[]> {
  return unstable_cache(
    async () => {
      try {
        const { data, error } = await supabaseAdmin
          .from('categories')
          .select('*')
          .order('display_order', { ascending: true });

        if (error || !data) return [];

        return data.map(cat => ({
          id: cat.id,
          name: cat.name,
          slug: cat.slug,
          description: cat.description,
          color: cat.color,
          order: cat.display_order ?? (cat as any).order ?? 0,
        }));
      } catch {
        return [];
      }
    },
    ['categories-list'],
    {
      tags: ['categories'],
      revalidate: 3600,
    }
  )();
}

export async function fetchCategoryBySlug(slug: string): Promise<CategoryItem | null> {
  return unstable_cache(
    async (s: string) => {
      try {
        const { data, error } = await supabaseAdmin
          .from('categories')
          .select('*')
          .eq('slug', s)
          .single();

        if (error || !data) return null;

        return {
          id: data.id,
          name: data.name,
          slug: data.slug,
          description: data.description,
          color: data.color,
          order: data.display_order ?? (data as any).order ?? 0,
        };
      } catch {
        return null;
      }
    },
    ['category-by-slug', slug],
    {
      tags: ['categories', `category:${slug}`],
      revalidate: 3600,
    }
  )(slug);
}
