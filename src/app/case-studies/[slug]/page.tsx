import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchCaseStudyBySlug, fetchCaseStudies } from '@/lib/supabase-db';
import { CaseStudyItem } from '@/types';
import { constructMetadata } from '@/lib/seo';
import { formatSimpleMarkdown } from '@/lib/sanitize';
import {
  ArrowLeft,
  Clock,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
} from 'lucide-react';
import { IconBriefcase } from '@tabler/icons-react';

export const revalidate = 0;

interface CaseStudyPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: CaseStudyPageProps) {
  const cs = await fetchCaseStudyBySlug(params.slug);

  if (!cs) return { title: 'Case Study Not Found' };

  return constructMetadata({
    title: `${cs.company} Case Study: ${cs.title}`,
    description: cs.summary,
    image: cs.coverImage || undefined,
    url: `https://ventureatlas.io/case-studies/${cs.slug}`,
  });
}

export default async function SingleCaseStudyPage({ params }: CaseStudyPageProps) {
  const cs = await fetchCaseStudyBySlug(params.slug);

  if (!cs) {
    notFound();
  }

  const allCs = await fetchCaseStudies(4);
  const related = allCs.filter(item => item.id !== cs.id).slice(0, 2);

  return (
    <div className="max-w-4xl mx-auto space-y-10 select-none">
      {/* Back Link */}
      <div>
        <Link
          href="/case-studies"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to All Case Studies</span>
        </Link>
      </div>

      {/* Header Banner */}
      <article className="space-y-8">
        <div className="space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
            <span className="px-3 py-1 rounded-full font-bold uppercase bg-surface-muted text-text-primary border border-border/70 shadow-xs">
              {cs.company}
            </span>
            <span className="text-text-tertiary">·</span>
            <span className="text-text-secondary font-medium">{cs.stage}</span>
            <span className="text-text-tertiary">·</span>
            <div className="flex items-center gap-1 text-text-secondary">
              <Clock size={12} />
              <span>{cs.readTimeMinutes} min deep read</span>
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-text-primary leading-tight tracking-tight">
            {cs.title}
          </h1>

          <p className="text-base sm:text-lg font-body text-text-secondary leading-relaxed font-normal">
            {cs.summary}
          </p>
        </div>

        {/* 3 Metric Stats Snapshot */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="p-5 rounded-2xl ios-card text-center space-y-1">
            <div className="text-xs font-mono text-text-tertiary uppercase">VALUATION</div>
            <div className="text-xl sm:text-2xl font-black font-display text-text-primary">
              {cs.valuation || 'Private'}
            </div>
          </div>

          <div className="p-5 rounded-2xl ios-card text-center space-y-1">
            <div className="text-xs font-mono text-text-tertiary uppercase">KEY SCALE METRIC</div>
            <div className="text-xl sm:text-2xl font-black font-display text-emerald-400">
              {cs.keyMetric || 'Breakout ARR'}
            </div>
          </div>

          <div className="p-5 rounded-2xl ios-card text-center space-y-1">
            <div className="text-xs font-mono text-text-tertiary uppercase">COMPANY STAGE</div>
            <div className="text-xl sm:text-2xl font-black font-display text-text-primary">
              {cs.stage || 'Scale'}
            </div>
          </div>
        </div>

        {/* Executive 3-Pillar Breakdown */}
        {(cs.challenge || cs.strategy || cs.outcome) && (
          <div className="p-6 sm:p-8 rounded-3xl ios-card space-y-6">
            <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-primary border-b border-border/50 pb-3">
              <IconBriefcase size={14} className="text-amber-400" />
              <span>EXECUTIVE PLAYBOOK BREAKDOWN</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 divide-y md:divide-y-0 md:divide-x divide-border/60">
              {/* Pillar 1 */}
              {cs.challenge && (
                <div className="space-y-2 pt-4 md:pt-0 md:pr-4">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-red-400">
                    <AlertTriangle size={13} />
                    <span>The Challenge</span>
                  </div>
                  <p className="text-xs font-body text-text-secondary leading-relaxed">
                    {cs.challenge}
                  </p>
                </div>
              )}

              {/* Pillar 2 */}
              {cs.strategy && (
                <div className="space-y-2 pt-4 md:pt-0 md:px-4">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-blue-400">
                    <Lightbulb size={13} />
                    <span>The Playbook</span>
                  </div>
                  <p className="text-xs font-body text-text-secondary leading-relaxed">
                    {cs.strategy}
                  </p>
                </div>
              )}

              {/* Pillar 3 */}
              {cs.outcome && (
                <div className="space-y-2 pt-4 md:pt-0 md:pl-4">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-emerald-400">
                    <CheckCircle2 size={13} />
                    <span>The Outcome</span>
                  </div>
                  <p className="text-xs font-body text-text-secondary leading-relaxed">
                    {cs.outcome}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Cover Photo */}
        {cs.coverImage && (
          <div className="w-full rounded-3xl overflow-hidden ios-card max-h-[460px]">
            <img src={cs.coverImage} alt={cs.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Full Analysis Body */}
        <div className="p-6 sm:p-10 ios-card rounded-3xl">
          <div
            className="editorial-prose text-base font-body text-text-primary"
            dangerouslySetInnerHTML={{ __html: formatSimpleMarkdown(cs.body) }}
          />
        </div>
      </article>

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
  );
}
