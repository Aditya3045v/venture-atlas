import React from 'react';
import Link from 'next/link';
import { Building2, ArrowLeft, Mail } from 'lucide-react';

import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Imprint & Corporate Notice',
  description: 'Legal publishing information, entity disclosures, and contact points for Venture Atlas.',
  canonicalPath: '/imprint',
  section: 'Legal',
});

export default function ImprintPage() {
  return (
    <div className="max-w-3xl mx-auto space-y-8 select-none py-4">
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-text-secondary hover:text-blue-600 dark:hover:text-amber-400 transition-colors"
        >
          <ArrowLeft size={14} />
          <span>Back to Feed</span>
        </Link>
      </div>

      <div className="space-y-3 pb-6 border-b border-border">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-blue-600 dark:text-amber-400">
          <Building2 size={16} />
          <span>Publisher Imprint</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-text-primary">
          Imprint & Editorial Information
        </h1>
        <p className="text-xs font-mono text-text-tertiary">
          Published according to international media standards
        </p>
      </div>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <div className="p-6 rounded-3xl bg-surface border border-border space-y-4">
          <div className="space-y-1">
            <div className="font-bold text-base font-display text-text-primary">
              Venture Atlas Media Inc.
            </div>
            <div className="font-mono text-xs text-text-tertiary">
              548 Market St, Suite 89201<br />
              San Francisco, CA 94104, United States
            </div>
          </div>

          <div className="pt-2 border-t border-border/60 space-y-2 text-xs font-mono">
            <div>
              <strong className="text-text-primary">Editor-in-Chief & Founder:</strong> Aditya Poddar
            </div>
            <div>
              <strong className="text-text-primary">Editorial Inquiries:</strong> editorial@ventureatlas.in
            </div>
            <div>
              <strong className="text-text-primary">Press & Media:</strong> press@ventureatlas.in
            </div>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-text-primary">
            Corrections & Editorial Standards
          </h2>
          <p>
            Venture Atlas enforces strict fact-checking standards across all 60-word briefs, term sheet analyses, and teardowns. To submit a correction or report a factual inaccuracy, email <strong>corrections@ventureatlas.in</strong> with the story title and primary source reference.
          </p>
        </section>
      </div>
    </div>
  );
}
