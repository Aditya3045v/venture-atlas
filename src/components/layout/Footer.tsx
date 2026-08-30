import React from 'react';
import Link from 'next/link';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full border-t border-border/80 bg-surface-muted/60 py-12 px-4 sm:px-6 lg:px-8 mt-16 transition-colors select-none">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <Link href="/" className="inline-block">
            {/* Dark mode logo */}
            <img
              src="/logo-dark.png"
              alt="Venture Atlas"
              className="hidden dark:block h-8 w-auto object-contain"
            />
            {/* Light mode logo */}
            <img
              src="/logo-light.png"
              alt="Venture Atlas"
              className="block dark:hidden h-8 w-auto object-contain"
            />
          </Link>
          <p className="text-xs text-text-secondary leading-relaxed font-body">
            Venture Atlas is an independent editorial intelligence publication reporting on technology, venture capital, and startups in 60-word briefs, long-form essays, and architectural case studies.
          </p>
          <div className="text-[11px] font-mono text-text-tertiary">
            © {new Date().getFullYear()} Venture Atlas Media Inc.
          </div>
        </div>

        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-3">
            Desks & Categories
          </h4>
          <ul className="space-y-2 text-xs font-medium text-text-secondary">
            <li><Link href="/categories/startups" className="hover:text-text-primary transition-colors">Early Stage Startups</Link></li>
            <li><Link href="/categories/funding" className="hover:text-text-primary transition-colors">Venture & Seed Funding</Link></li>
            <li><Link href="/categories/venture-capital" className="hover:text-text-primary transition-colors">Venture Capital Funds</Link></li>
            <li><Link href="/categories/ai-and-tech" className="hover:text-text-primary transition-colors">Artificial Intelligence</Link></li>
            <li><Link href="/categories/fintech" className="hover:text-text-primary transition-colors">Fintech & Global Rails</Link></li>
            <li><Link href="/categories/markets-and-m-and-a" className="hover:text-text-primary transition-colors">Public Markets & M&A</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-3">
            Analysis & Intelligence
          </h4>
          <ul className="space-y-2 text-xs font-medium text-text-secondary">
            <li><Link href="/case-studies" className="hover:text-text-primary transition-colors font-bold text-text-primary">Startup Case Studies</Link></li>
            <li><Link href="/blogs" className="hover:text-text-primary transition-colors">Long-form Blogs & Essays</Link></li>
            <li><Link href="/bookmarks" className="hover:text-text-primary transition-colors">Saved Library</Link></li>
            <li><Link href="/account" className="hover:text-text-primary transition-colors">Reading Preferences</Link></li>
            <li><Link href="/admin" className="hover:text-text-primary transition-colors">Editorial Portal (CMS)</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-3">
            Editorial Standards
          </h4>
          <p className="text-xs text-text-secondary leading-relaxed mb-3">
            All news briefs and case study teardowns are fact-checked and verified against primary SEC filings, financial ledgers, and founder interviews.
          </p>
          <div className="inline-block px-2.5 py-1 rounded-full bg-surface border border-border/80 text-[10px] font-mono font-bold text-text-tertiary">
            WCAG 2.2 AA ACCESSIBLE
          </div>
        </div>
      </div>
    </footer>
  );
};
