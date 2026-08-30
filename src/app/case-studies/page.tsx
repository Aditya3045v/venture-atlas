import React from 'react';
import Link from 'next/link';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { CaseStudyItem } from '@/types';
import { Briefcase, ArrowRight, TrendingUp, Building2, CheckCircle2 } from 'lucide-react';
import { IconBriefcase } from '@tabler/icons-react';
import { formatDistanceToNow } from 'date-fns';

export const revalidate = 0;

export default async function CaseStudiesPage() {
  await ensureDatabaseSeeded();

  const caseStudies = await prisma.caseStudy.findMany({
    where: { status: 'PUBLISHED' },
    include: {
      category: true,
      author: true,
    },
    orderBy: { publishedAt: 'desc' },
  });

  const featured = caseStudies[0];
  const remaining = caseStudies.slice(1);

  return (
    <div className="space-y-10 max-w-6xl mx-auto select-none">
      {/* Header */}
      <div className="p-8 sm:p-10 rounded-3xl ios-card space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-tertiary">
          <Briefcase size={15} className="text-text-primary" />
          <span>OPERATOR & FOUNDER INTELLIGENCE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display uppercase tracking-tight text-text-primary">
          Startup Deep Dives & Case Studies
        </h1>
        <p className="text-sm md:text-base text-text-secondary font-body max-w-3xl leading-relaxed">
          Rigorous breakdowns of breakout software architecture, zero-CAC distribution flywheels, unit economics, and scaling triumphs across elite venture-backed companies.
        </p>
      </div>

      {/* Featured Lead Case Study */}
      {featured && (
        <section className="relative rounded-3xl ios-card overflow-hidden group">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            <div className="lg:col-span-6 relative h-72 sm:h-96 bg-surface-muted overflow-hidden">
              {featured.coverImage && (
                <img
                  src={featured.coverImage}
                  alt={featured.title}
                  className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
                />
              )}
              <div className="absolute top-4 left-4 flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-xs flex items-center gap-1.5">
                  <IconBriefcase size={12} className="text-amber-400" />
                  <span>SPOTLIGHT TEARDOWN</span>
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white/90 border border-white/10 shadow-xs">
                  {featured.company}
                </span>
              </div>
            </div>

            <div className="lg:col-span-6 p-6 sm:p-8 flex flex-col justify-between space-y-4">
              <div className="space-y-4">
                <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                  {featured.valuation && (
                    <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      Valuation: {featured.valuation}
                    </span>
                  )}
                  {featured.keyMetric && (
                    <span className="px-2.5 py-1 rounded-full bg-surface-muted text-text-primary border border-border/80 font-bold">
                      {featured.keyMetric}
                    </span>
                  )}
                  <span className="text-text-tertiary">· {featured.readTimeMinutes} min read</span>
                </div>

                <Link href={`/case-studies/${featured.slug}`}>
                  <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-text-primary leading-tight tracking-tight group-hover:opacity-90 transition-opacity">
                    {featured.title}
                  </h2>
                </Link>

                <p className="text-sm font-body text-text-secondary leading-relaxed line-clamp-3">
                  {featured.summary}
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between">
                <span className="text-xs font-mono text-text-tertiary">
                  Stage: <span className="font-semibold text-text-primary">{featured.stage || 'Scale'}</span>
                </span>
                <Link
                  href={`/case-studies/${featured.slug}`}
                  className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-text-primary text-background text-xs font-bold font-mono uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 shadow-xs"
                >
                  <span>Read full teardown</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Grid of Remaining Case Studies */}
      <section className="space-y-4">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-text-tertiary">
          ALL STARTUP TEARDOWNS & ARCHITECTURAL STUDIES
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {(remaining as unknown as CaseStudyItem[]).map(cs => (
            <article
              key={cs.id}
              className="ios-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface-muted text-text-primary border border-border/70">
                      {cs.company}
                    </span>
                    <span className="text-text-tertiary">·</span>
                    <span className="text-text-tertiary">{cs.stage}</span>
                  </div>
                  <span className="text-text-tertiary">{cs.readTimeMinutes} min read</span>
                </div>

                <Link href={`/case-studies/${cs.slug}`}>
                  <h3 className="text-xl font-bold font-display text-text-primary group-hover:opacity-90 transition-opacity leading-snug line-clamp-2">
                    {cs.title}
                  </h3>
                </Link>

                <p className="text-xs sm:text-sm font-body text-text-secondary leading-relaxed line-clamp-3">
                  {cs.summary}
                </p>

                {/* Key Metric Badge */}
                {cs.keyMetric && (
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-surface-muted text-text-primary border border-border/60">
                      <TrendingUp size={12} className="text-emerald-500" />
                      <span>{cs.keyMetric}</span>
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono">
                <span className="text-text-tertiary">Valuation: <strong className="text-text-primary">{cs.valuation || 'Private'}</strong></span>
                <Link
                  href={`/case-studies/${cs.slug}`}
                  className="text-text-primary font-bold hover:underline flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                >
                  <span>Explore playbook</span>
                  <ArrowRight size={13} />
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
