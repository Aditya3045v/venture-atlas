import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { ArticleItem } from '@/types';
import { constructMetadata, generateArticleJsonLd } from '@/lib/seo';
import { formatSimpleMarkdown } from '@/lib/sanitize';
import { StoryCard } from '@/components/news/StoryCard';
import { ArrowLeft, Clock, ExternalLink, BookOpen, Share2 } from 'lucide-react';
import { IconBolt } from '@tabler/icons-react';
import { formatDistanceToNow, format } from 'date-fns';

export const revalidate = 0;

interface ArticlePageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: ArticlePageProps) {
  await ensureDatabaseSeeded();
  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
  });

  if (!article) return { title: 'Article Not Found' };

  return constructMetadata({
    title: article.title,
    description: article.summary,
    image: article.coverImage,
    url: `https://ventureatlas.io/articles/${article.slug}`,
  });
}

export default async function ArticlePage({ params }: ArticlePageProps) {
  await ensureDatabaseSeeded();

  const article = await prisma.article.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      author: true,
      tags: { include: { tag: true } },
    },
  });

  if (!article) {
    notFound();
  }

  // Increment view count
  try {
    await prisma.article.update({
      where: { id: article.id },
      data: { viewCount: { increment: 1 } },
    });
  } catch (err) {
    // Non-critical background view increment
  }

  // Fetch related stories
  const relatedArticles = await prisma.article.findMany({
    where: {
      categoryId: article.categoryId,
      id: { not: article.id },
      status: 'PUBLISHED',
    },
    include: {
      category: true,
      author: true,
    },
    take: 3,
  });

  const formattedDate = article.publishedAt
    ? format(new Date(article.publishedAt), 'MMMM d, yyyy · h:mm a')
    : 'Draft';

  const jsonLd = generateArticleJsonLd(article as unknown as ArticleItem);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-text-secondary hover:text-brand transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to All Streams</span>
          </Link>
        </div>

        {/* Main Article Header */}
        <article className="space-y-6">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-2.5 text-xs font-mono">
              <span
                className="px-3 py-1 rounded-md font-bold uppercase text-white shadow-sm"
                style={{ backgroundColor: article.category?.color || '#2563EB' }}
              >
                {article.category?.name}
              </span>
              <span className="text-text-tertiary">·</span>
              <span className="font-bold text-text-secondary">
                {article.sourceName || 'Venture Atlas Original'}
              </span>
              <span className="text-text-tertiary">·</span>
              <span className="text-text-tertiary">{formattedDate}</span>
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black font-display text-text-primary leading-tight tracking-tight">
              {article.title}
            </h1>
          </div>

          {/* 60-Word Executive Summary Callout */}
          <div className="p-5 sm:p-6 rounded-2xl bg-surface border-l-4 border-brand border-y border-r border-border shadow-card space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase tracking-wider text-brand">
              <IconBolt size={14} />
              <span>THE 60-WORD EXECUTIVE BRIEF</span>
            </div>
            <p className="text-base sm:text-lg font-body text-text-primary leading-relaxed font-medium">
              {article.summary}
            </p>
          </div>

          {/* Hero Cover Image */}
          {article.coverImage && (
            <div className="relative w-full rounded-2xl overflow-hidden border border-border bg-surface-muted max-h-[460px]">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover"
              />
              {article.photoCredit && (
                <div className="p-2 text-right text-[10px] font-mono text-text-tertiary bg-surface/80 backdrop-blur-xs border-t border-border">
                  Photo Credit: {article.photoCredit}
                </div>
              )}
            </div>
          )}

          {/* Full Article Body (Formatted Markdown) */}
          <div className="p-6 sm:p-8 bg-surface rounded-2xl border border-border shadow-card">
            <div
              className="editorial-prose text-base font-body text-text-primary"
              dangerouslySetInnerHTML={{ __html: formatSimpleMarkdown(article.body) }}
            />

            {/* Source Citation */}
            {article.sourceUrl && (
              <div className="mt-8 pt-6 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="text-xs font-mono text-text-secondary">
                  Original Source: <span className="font-bold text-text-primary">{article.sourceName}</span>
                </div>
                <a
                  href={article.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-muted hover:bg-border text-text-primary text-xs font-mono font-bold uppercase transition-colors shadow-sm self-start"
                >
                  <span>Verify at {article.sourceName || 'Source'}</span>
                  <ExternalLink size={13} />
                </a>
              </div>
            )}
          </div>

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-2">
              <span className="text-xs font-mono text-text-tertiary uppercase">Tags:</span>
              {article.tags.map(t => (
                <span
                  key={t.tag.id}
                  className="px-2.5 py-1 rounded-lg bg-surface-muted border border-border text-xs font-mono font-medium text-text-secondary"
                >
                  #{t.tag.name}
                </span>
              ))}
            </div>
          )}
        </article>

        {/* Related Stories Section */}
        {relatedArticles.length > 0 && (
          <section className="mt-16 pt-10 border-t border-border space-y-6">
            <h3 className="text-xl font-bold font-display text-text-primary uppercase tracking-tight">
              Related in {article.category?.name}
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
