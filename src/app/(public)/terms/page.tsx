import React from 'react';
import Link from 'next/link';
import { FileText, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Terms of Service — Venture Atlas',
  description: 'Terms and conditions governing the use of Venture Atlas editorial briefings and playbooks.',
};

export default function TermsOfServicePage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 select-none py-4">
      {/* Back Link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-text-secondary hover:text-blue-600 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Feed</span>
        </Link>
      </div>

      {/* Header */}
      <div className="space-y-3 pb-6 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-blue-600 dark:text-amber-400">
          <FileText size={16} />
          <span>Legal Agreement</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-text-primary">
          Terms of Service
        </h1>
        <p className="text-xs font-mono text-text-tertiary">
          Effective Date: September 1, 2026
        </p>
      </div>

      {/* Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-text-secondary leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-text-primary">
            1. Acceptance of Terms
          </h2>
          <p>
            By accessing or using Venture Atlas (including the website, API, audio briefings, and case study teardowns), you agree to be bound by these Terms of Service. If you do not agree to these terms, do not use the platform.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-text-primary">
            2. Editorial Disclaimers & Financial Notice
          </h2>
          <p>
            The content provided on Venture Atlas is for informational and educational purposes only. None of the articles, valuations, teardowns, or analysis constitute financial, investment, or legal advice. Venture Atlas is not a registered investment advisor or broker-dealer.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-text-primary">
            3. Intellectual Property Rights
          </h2>
          <p>
            All original 60-word briefs, editorial essays, case studies, visualizations, and software code are the proprietary intellectual property of Venture Atlas Media Inc. You may share links to our content or quote brief excerpts with clear attribution and a backlink to the source URL.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-text-primary">
            4. Prohibited Uses & Scraping
          </h2>
          <p>
            Automated scraping, excessive polling, reverse-engineering of private APIs, or distribution of unauthorized derivative works is strictly prohibited.
          </p>
        </section>
      </div>
    </div>
  );
}
