import React from 'react';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { constructMetadata, generateOrganizationJsonLd } from '@/lib/seo';
import { Shield, Sparkles, BookOpen, CheckCircle2, AlertCircle, ArrowLeft, Globe, FileText } from 'lucide-react';

export const metadata = constructMetadata({
  title: 'About & Editorial Standards',
  description: 'Venture Atlas editorial charter: our 60-word concise news rule, primary sourcing policy, and transparent corrections framework.',
  canonicalPath: '/about',
  section: 'Editorial Policy',
});

export default function AboutEditorialPage() {
  const orgJsonLd = generateOrganizationJsonLd();

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgJsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-10 select-none py-2">
        <Breadcrumbs
          items={[
            { name: 'About & Standards', url: '/about' },
          ]}
        />

        {/* Hero Banner */}
        <div className="p-8 sm:p-10 rounded-3xl border border-border bg-surface shadow-card space-y-4">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-brand">
            <Shield size={16} />
            <span>JOURNALISTIC CHARTER & MISSION</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black font-display uppercase tracking-tight text-text-primary leading-none">
            Intelligence Built for Builders & Capital Allocators
          </h1>
          <p className="text-sm sm:text-base font-body text-text-secondary leading-relaxed max-w-3xl">
            Venture Atlas is an independent publication dedicated to tracking private markets, high-growth startups, and capital formation. We replace algorithmic clickbait with hyper-dense, verified executive briefings.
          </p>
        </div>

        {/* 3 Pillar Editorial Standards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pillar 1 */}
          <div className="p-6 rounded-3xl border border-border bg-surface shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
              60W
            </div>
            <h3 className="text-lg font-bold font-display text-text-primary">
              The 60-Word Rule
            </h3>
            <p className="text-xs font-body text-text-secondary leading-relaxed">
              Every news wire dispatch is constrained to ~60 words. No speculative padding or narrative fluff — only the valuation, lead investor, round stage, and market consequence.
            </p>
          </div>

          {/* Pillar 2 */}
          <div className="p-6 rounded-3xl border border-border bg-surface shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 size={20} />
            </div>
            <h3 className="text-lg font-bold font-display text-text-primary">
              Primary Sourcing
            </h3>
            <p className="text-xs font-body text-text-secondary leading-relaxed">
              We corroborate reporting against SEC Form D filings, direct cap table memos, investor shareholder letters, and verified founders before publication.
            </p>
          </div>

          {/* Pillar 3 */}
          <div className="p-6 rounded-3xl border border-border bg-surface shadow-xs space-y-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <AlertCircle size={20} />
            </div>
            <h3 className="text-lg font-bold font-display text-text-primary">
              Transparent Corrections
            </h3>
            <p className="text-xs font-body text-text-secondary leading-relaxed">
              If a factual inaccuracy or valuation error occurs, we issue an explicit correction note with an immutable timestamp on the article record.
            </p>
          </div>
        </div>

        {/* Detailed Guidelines */}
        <div className="p-8 rounded-3xl border border-border bg-surface space-y-6">
          <h2 className="text-2xl font-black font-display text-text-primary uppercase tracking-tight">
            Editorial Guidelines & Ethics
          </h2>

          <div className="space-y-4 text-xs font-body text-text-secondary leading-relaxed">
            <div>
              <h4 className="font-bold text-text-primary text-sm font-display mb-1">
                1. Attribution & Intellectual Honesty
              </h4>
              <p>
                Every brief credits the reporting reporter, primary source entity, and publication link. We respect exclusive reporting from peer outlets and provide direct, visible outbound links to original reports.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-text-primary text-sm font-display mb-1">
                2. Separation of News and Sponsored Content
              </h4>
              <p>
                Editorial decisions are completely firewalled from any commercial partnerships or sponsorship arrangements. Sponsored teardowns or partner features are strictly demarcated with clear badges.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-text-primary text-sm font-display mb-1">
                3. Corrections & Feedback Desk
              </h4>
              <p>
                To request a factual review or submit verified term sheet data, contact the editorial desk at <span className="text-text-primary font-mono font-bold">editorial@ventureatlas.in</span>.
              </p>
            </div>
          </div>

          {/* Contextual In-Body Navigation */}
          <div className="pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-4 text-text-tertiary">
              <Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy</Link>
              <span>·</span>
              <Link href="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link>
              <span>·</span>
              <Link href="/cookies" className="hover:text-text-primary transition-colors">Cookie Policy</Link>
              <span>·</span>
              <Link href="/imprint" className="hover:text-text-primary transition-colors">Imprint</Link>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/search" className="text-brand font-bold hover:underline">Search Archives →</Link>
              <Link href="/landing" className="text-text-secondary hover:text-text-primary">Executive Briefing →</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
