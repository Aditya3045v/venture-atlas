import React from 'react';
import { notFound } from 'next/navigation';
import { fetchCategories, fetchArticles } from '@/lib/supabase-db';
import { StoryCard } from '@/components/news/StoryCard';
import { CategoryStrip } from '@/components/news/CategoryStrip';
import { ArticleItem, CategoryItem } from '@/types';
import { constructMetadata } from '@/lib/seo';

export const revalidate = 0;

interface CategoryPageProps {
  params: { slug: string };
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

      {/* Category Filter Strip */}
      <CategoryStrip categories={allCategories as CategoryItem[]} activeSlug={params.slug} />

      {/* Articles Grid */}
      {articles.length === 0 ? (
        <div className="p-12 text-center bg-surface rounded-2xl border border-border shadow-card">
          <h3 className="text-base font-bold font-display uppercase text-text-primary mb-1">
            No Published Shorts in this Desk Yet
          </h3>
          <p className="text-xs font-mono text-text-tertiary max-w-sm mx-auto">
            Check back as new verified reporting is published by the editorial board.
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
