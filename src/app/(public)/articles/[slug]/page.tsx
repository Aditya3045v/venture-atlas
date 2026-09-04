import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchArticleBySlug, fetchArticles, fetchCaseStudyByCompany } from '@/lib/supabase-db';
import { ArticleItem } from '@/types';
import { constructMetadata, generateNewsArticleJsonLd } from '@/lib/seo';
import { CanvasStoryView } from '@/components/canvas/CanvasStoryView';
import { StoryCard } from '@/components/news/StoryCard';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ReadingProgressBar } from '@/components/ui/ReadingProgressBar';
import { ViewTracker } from '@/components/analytics/ViewTracker';
import { ArrowLeft, ArrowUpRight, Briefcase } from 'lucide-react';

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

  if (!article) return { title: 'Article Not Found — Venture Atlas' };

  const publishedIso = article.publishedAt 
    ? new Date(article.publishedAt).toISOString()
    : new Date(article.createdAt).toISOString();
  
  const modifiedIso = article.updatedAt 
    ? new Date(article.updatedAt).toISOString() 
    : publishedIso;

  return constructMetadata({
    title: article.seoTitle || article.title,
    description: article.seoDescription || article.summary,
    canonicalPath: `/articles/${article.slug}`,
    image: article.coverImage || undefined,
    imageAlt: article.seoTitle || article.title,
    type: 'article',
    publishedTime: publishedIso,
    modifiedTime: modifiedIso,
    authors: [article.sourceAuthor || article.author?.name || 'Venture Atlas Editorial Board'],
    section: article.category?.name || 'Venture Capital',
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  const article = await fetchArticleBySlug(params.slug);

  if (!article) {
    notFound();
  }

  // Fetch related stories and cross-type company case study in parallel
  const [allRelated, matchedCaseStudy] = await Promise.all([
    fetchArticles({
      categorySlug: article.category?.slug,
      limit: 5,
    }),
    article.company ? fetchCaseStudyByCompany(article.company) : Promise.resolve(null),
  ]);

  const relatedArticles = allRelated.filter(a => a.id !== article.id).slice(0, 3);
  const jsonLd = generateNewsArticleJsonLd(article as unknown as ArticleItem);

  return (
    <>
      <ReadingProgressBar />
      <ViewTracker entityId={article.id} entityType="ARTICLE" path={`/articles/${article.slug}`} />

      {/* Server-rendered Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Visible Breadcrumbs matching BreadcrumbList Schema */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <Breadcrumbs
            items={[
              {
                name: article.category?.name || 'News',
                url: `/categories/${article.category?.slug || 'unicorn'}`,
              },
              {
                name: article.title,
                url: `/articles/${article.slug}`,
              },
            ]}
          />
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-text-secondary hover:text-blue-600 dark:hover:text-amber-400 transition-colors shrink-0"
          >
            <ArrowLeft size={13} />
            <span>All Streams</span>
          </Link>
        </div>

        {/* Detailed Canvas Story View */}
        <CanvasStoryView story={article} />

        {/* Cross-Type Entity Deep-Dive Link (Article -> Case Study) */}
        {matchedCaseStudy && (
          <div className="p-6 rounded-3xl border border-blue-500/30 bg-blue-500/5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400">
                <Briefcase size={15} />
                <span>Deep-Dive Company Playbook</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-300 border border-blue-500/20">
                {matchedCaseStudy.valuation || 'Featured Teardown'}
              </span>
            </div>
            <div>
              <h4 className="text-base sm:text-lg font-black font-display text-text-primary">
                Explore the Full Business Model Breakdown: {matchedCaseStudy.company}
              </h4>
              <p className="text-xs font-mono text-text-secondary mt-1">
                {matchedCaseStudy.summary}
              </p>
            </div>
            <Link
              href={`/case-studies/${matchedCaseStudy.slug}`}
              className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400 hover:underline pt-1"
            >
              <span>Read Full {matchedCaseStudy.company} Case Study</span>
              <ArrowUpRight size={14} />
            </Link>
          </div>
        )}

        {/* Related Stories Section */}
        {relatedArticles.length > 0 && (
          <section className="mt-14 pt-8 border-t border-border space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-black font-display text-text-primary uppercase tracking-tight">
                Related in {article.category?.name || 'This Desk'}
              </h3>
              <Link
                href={`/categories/${article.category?.slug || 'unicorn'}`}
                className="text-xs font-mono font-bold uppercase text-brand hover:underline"
              >
                View Desk Stream →
              </Link>
            </div>
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

