import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchArticleBySlug, fetchArticles } from '@/lib/supabase-db';
import { ArticleItem } from '@/types';
import { constructMetadata, generateArticleJsonLd } from '@/lib/seo';
import { CanvasStoryView } from '@/components/canvas/CanvasStoryView';
import { StoryCard } from '@/components/news/StoryCard';
import { ReadingProgressBar } from '@/components/ui/ReadingProgressBar';
import { ViewTracker } from '@/components/analytics/ViewTracker';
import { ArrowLeft } from 'lucide-react';
export const revalidate = 3600; // 1 hour ISR

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const articles = await fetchArticles({ limit: 50 });
  return articles.map(a => ({
    slug: a.slug,
  }));
}

export async function generateMetadata({ params }: ArticlePageProps) {
  const article = await fetchArticleBySlug(params.slug);

  if (!article) return { title: 'Article Not Found' };

  return constructMetadata({
    title: article.title,
    description: article.summary,
    image: article.coverImage || undefined,
    url: `https://ventureatlas.io/articles/${article.slug}`,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await fetchArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  // Fetch related stories in the same desk/category
  const relatedArticles = (await fetchArticles({
    categorySlug: article.category?.slug,
    limit: 4,
  })).filter(a => a.id !== article.id).slice(0, 3);

  const jsonLd = generateArticleJsonLd(article as unknown as ArticleItem);

  return (
    <>
      <ReadingProgressBar />
      <ViewTracker entityId={article.id} entityType="ARTICLE" path={`/articles/${article.slug}`} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-text-secondary hover:text-blue-600 dark:hover:text-amber-400 transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to All Streams</span>
          </Link>
        </div>

        {/* Detailed Canvas Story View */}
        <CanvasStoryView story={article} />

        {/* Related Stories Section */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border space-y-6">
            <h3 className="text-xl font-bold font-display text-text-primary uppercase tracking-tight">
              Related in {article.category?.name || 'This Desk'}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {(relatedArticles as unknown as ArticleItem[]).map(related => (
                <StoryCard key={related.id} article={related} />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
