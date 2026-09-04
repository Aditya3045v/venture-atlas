import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchCaseStudyBySlug, fetchCaseStudies, fetchArticles } from '@/lib/supabase-db';
import { CaseStudyItem, ArticleItem } from '@/types';
import { constructMetadata, generateArticleJsonLd } from '@/lib/seo';
import { CanvasStoryView } from '@/components/canvas/CanvasStoryView';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ReadingProgressBar } from '@/components/ui/ReadingProgressBar';
import { ViewTracker } from '@/components/analytics/ViewTracker';
import { ArrowLeft, Newspaper, ArrowUpRight } from 'lucide-react';

export const revalidate = 3600; // 1 hour ISR

interface CaseStudyPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const caseStudies = await fetchCaseStudies(20);
  return caseStudies.map(cs => ({
    slug: cs.slug,
  }));
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const cs = await fetchCaseStudyBySlug(params.slug);

  if (!cs) return { title: 'Case Study Not Found — Venture Atlas' };

  const publishedIso = cs.publishedAt
    ? new Date(cs.publishedAt).toISOString()
    : new Date(cs.createdAt).toISOString();

  const modifiedIso = cs.updatedAt
    ? new Date(cs.updatedAt).toISOString()
    : publishedIso;

  // Prefix company name only if title does not already start with company name
  const pageTitle = cs.title.toLowerCase().startsWith(cs.company.toLowerCase())
    ? cs.title
    : `${cs.company}: ${cs.title}`;

  return constructMetadata({
    title: pageTitle,
    description: cs.summary,
    canonicalPath: `/case-studies/${cs.slug}`,
    image: cs.coverImage || undefined,
    imageAlt: `${cs.company} Case Study`,
    type: 'article',
    publishedTime: publishedIso,
    modifiedTime: modifiedIso,
    authors: [cs.author?.name || 'Venture Atlas Editorial Board'],
    section: 'Case Studies',
  });
}

export default async function SingleCaseStudyPage({ params }: CaseStudyPageProps) {
  const cs = await fetchCaseStudyBySlug(params.slug);

  if (!cs) {
    notFound();
  }

  const [allCs, relatedBriefs] = await Promise.all([
    fetchCaseStudies(4),
    fetchArticles({ limit: 10 }),
  ]);

  const related = allCs.filter(item => item.id !== cs.id).slice(0, 2);
  const companyBriefs = relatedBriefs.filter(
    b => b.company?.toLowerCase() === cs.company.toLowerCase() || b.title.toLowerCase().includes(cs.company.toLowerCase())
  ).slice(0, 2);

  const jsonLd = generateArticleJsonLd(cs, 'case-study');

  return (
    <>
      <ReadingProgressBar />
      <ViewTracker entityId={cs.id} entityType="CASE_STUDY" path={`/case-studies/${cs.slug}`} />

      {/* Server-rendered Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-8 select-none">
        {/* Visible Breadcrumbs matching Schema */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <Breadcrumbs
            items={[
              { name: 'Case Studies', url: '/case-studies' },
              { name: `${cs.company} Blueprint`, url: `/case-studies/${cs.slug}` },
            ]}
          />
          <Link
            href="/case-studies"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-text-secondary hover:text-text-primary transition-colors shrink-0"
          >
            <ArrowLeft size={13} />
            <span>All Case Studies</span>
          </Link>
        </div>

        {/* Canvas Story Card View */}
        <CanvasStoryView story={cs} />

        {/* Cross-Type Entity Linking (Case Study -> Live News Briefs) */}
        {companyBriefs.length > 0 && (
          <div className="p-6 rounded-3xl border border-amber-500/30 bg-amber-500/5 shadow-card space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                <Newspaper size={15} />
                <span>Live News Wire Coverage</span>
              </div>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-300 border border-amber-500/20">
                Fresh Wire Dispatches
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {companyBriefs.map(brief => (
                <Link
                  key={brief.id}
                  href={`/articles/${brief.slug}`}
                  className="p-3.5 rounded-2xl bg-surface border border-border hover:border-amber-500/40 transition-all block group space-y-1.5"
                >
                  <span className="text-[9px] font-mono uppercase text-amber-600 font-bold block">
                    60-Word Brief
                  </span>
                  <h5 className="font-bold text-xs font-display text-text-primary group-hover:text-amber-600 transition-colors line-clamp-2">
                    {brief.title}
                  </h5>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Related Case Studies */}
        {related.length > 0 && (
          <section className="pt-10 border-t border-border/60 space-y-6">
            <h3 className="text-xl font-bold font-display text-text-primary uppercase tracking-tight">
              More Breakout Case Studies
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {(related as unknown as CaseStudyItem[]).map(item => (
                <Link
                  key={item.id}
                  href={`/case-studies/${item.slug}`}
                  className="ios-card rounded-3xl p-6 space-y-3 group block"
                >
                  <div className="flex items-center justify-between text-xs font-mono text-text-tertiary">
                    <span className="font-bold text-text-primary">{item.company}</span>
                    <span>{item.readTimeMinutes} min read</span>
                  </div>
                  <h4 className="font-bold font-display text-base text-text-primary group-hover:opacity-90 transition-opacity">
                    {item.title}
                  </h4>
                  <p className="text-xs font-body text-text-secondary line-clamp-2">
                    {item.summary}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}

