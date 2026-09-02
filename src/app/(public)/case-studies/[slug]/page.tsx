import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchCaseStudyBySlug, fetchCaseStudies } from '@/lib/supabase-db';
import { CaseStudyItem } from '@/types';
import { constructMetadata } from '@/lib/seo';
import { CanvasStoryView } from '@/components/canvas/CanvasStoryView';
import { ReadingProgressBar } from '@/components/ui/ReadingProgressBar';
import { ViewTracker } from '@/components/analytics/ViewTracker';
import { ArrowLeft } from 'lucide-react';
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
    <>
      <ReadingProgressBar />
      <ViewTracker entityId={cs.id} entityType="CASE_STUDY" path={`/case-studies/${cs.slug}`} />

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

        {/* Canvas Story Card View */}
        <CanvasStoryView story={cs} />

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
