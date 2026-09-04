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
            © {new Date().getFullYear()} Venture Atlas Media Inc. All rights reserved.
          </div>
        </div>

        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-3">
            Desks & Categories
          </h4>
          <ul className="space-y-2 text-xs font-medium text-text-secondary">
            <li><Link href="/categories/unicorn" className="hover:text-text-primary transition-colors">Unicorn</Link></li>
            <li><Link href="/categories/failure" className="hover:text-text-primary transition-colors">Failure & Post-Mortems</Link></li>
            <li><Link href="/categories/finance" className="hover:text-text-primary transition-colors">Finance & Venture Lending</Link></li>
            <li><Link href="/categories/crypto-web3" className="hover:text-text-primary transition-colors">Crypto Web3</Link></li>
            <li><Link href="/categories/founder-biography" className="hover:text-text-primary transition-colors">Founder Biography</Link></li>
            <li><Link href="/case-studies" className="hover:text-text-primary transition-colors">Case Studies</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-3">
            Analysis & Intelligence
          </h4>
          <ul className="space-y-2 text-xs font-medium text-text-secondary">
            <li><Link href="/case-studies" className="hover:text-text-primary transition-colors font-bold text-text-primary">Startup Case Studies</Link></li>
            <li><Link href="/blogs" className="hover:text-text-primary transition-colors">Long-form Blogs & Essays</Link></li>
            <li><Link href="/search" className="hover:text-text-primary transition-colors">Search Intelligence</Link></li>
            <li><Link href="/bookmarks" className="hover:text-text-primary transition-colors">Saved Library</Link></li>
            <li><Link href="/account" className="hover:text-text-primary transition-colors">Reading Preferences</Link></li>
            <li><Link href="/admin" className="hover:text-text-primary transition-colors">Editorial Portal (CMS)</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary mb-3">
            Compliance & Standards
          </h4>
          <ul className="space-y-2 text-xs font-medium text-text-secondary mb-4">
            <li><Link href="/about" className="hover:text-text-primary transition-colors font-bold text-text-primary">Editorial Standards & About</Link></li>
            <li><Link href="/privacy" className="hover:text-text-primary transition-colors">Privacy Policy & GDPR</Link></li>
            <li><Link href="/terms" className="hover:text-text-primary transition-colors">Terms of Service</Link></li>
            <li><Link href="/cookies" className="hover:text-text-primary transition-colors">Cookie Preferences</Link></li>
            <li><Link href="/imprint" className="hover:text-text-primary transition-colors">Publisher Imprint & Contact</Link></li>
          </ul>
          <div className="inline-block px-2.5 py-1 rounded-full bg-surface border border-border/80 text-[10px] font-mono font-bold text-text-tertiary">
            WCAG 2.1 AA ACCESSIBLE
          </div>
        </div>
      </div>
    </footer>
  );
};
