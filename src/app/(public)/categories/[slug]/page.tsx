import React from 'react';
import { notFound } from 'next/navigation';
import { fetchCategories, fetchArticles } from '@/lib/supabase-db';
import { StoryCard } from '@/components/news/StoryCard';
import { CategoryStrip } from '@/components/news/CategoryStrip';
import { ArticleItem, CategoryItem } from '@/types';
import { constructMetadata } from '@/lib/seo';
export const revalidate = 3600; // 1 hour ISR

interface CategoryPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const categories = await fetchCategories();
  return categories.map(c => ({
    slug: c.slug,
  }));
}

export async function generateMetadata({ params }: CategoryPageProps) {
  const categories = await fetchCategories();
  const category = categories.find(c => c.slug === params.slug);

  if (!category) return { title: 'Category Not Found' };

  return constructMetadata({
    title: `${category.name} News & Briefs`,
    description: category.description || `Read the latest ${category.name} news briefs and venture analysis on Venture Atlas.`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const [allCategories, articles] = await Promise.all([
    fetchCategories(),
    fetchArticles({ categorySlug: params.slug, limit: 30 }),
  ]);

  const category = allCategories.find(c => c.slug === params.slug);

  if (!category) {
    notFound();
  }

  return (
    <div className="space-y-6">
      {/* Category Header Banner */}
      <div
        className="p-6 md:p-8 rounded-2xl border border-border bg-surface text-text-primary shadow-card relative overflow-hidden"
      >
        <div
          className="absolute top-0 left-0 bottom-0 w-2"
          style={{ backgroundColor: category.color }}
        />
        <div className="space-y-2 max-w-2xl pl-2">
          <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-tertiary">
            EDITORIAL DESK
          </div>
          <h1 className="text-2xl md:text-4xl font-black font-display uppercase tracking-tight">
            {category.name}
          </h1>
          <p className="text-sm text-text-secondary font-body leading-relaxed">
            {category.description}
          </p>
        </div>
      </div>

      {/* Categories Navigation Strip */}
      <CategoryStrip
        categories={allCategories as unknown as CategoryItem[]}
        activeSlug={category.slug}
      />

      {/* Grid of Articles in this Desk */}
      {articles.length === 0 ? (
        <div className="text-center py-16 p-8 border border-border/80 rounded-2xl bg-surface">
          <p className="text-sm text-text-secondary font-body">
            No briefings published in {category.name} yet. Check back shortly.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {(articles as unknown as ArticleItem[]).map(article => (
            <StoryCard key={article.id} article={article} />
          ))}
        </div>
      )}
    </div>
  );
}
