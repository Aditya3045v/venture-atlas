import React from 'react';
import Link from 'next/link';
import { Cookie, ArrowLeft } from 'lucide-react';

import { constructMetadata } from '@/lib/seo';

export const metadata = constructMetadata({
  title: 'Cookie Policy',
  description: 'Understand how Venture Atlas uses essential and functional cookies for theme and reader preferences.',
  canonicalPath: '/cookies',
  section: 'Legal',
});

export default function CookiePolicyPage() {
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
          <Cookie size={16} />
          <span>Cookie Notice</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-text-primary">
          Cookie & Local Storage Policy
        </h1>
        <p className="text-xs font-mono text-text-tertiary">
          Effective Date: September 1, 2026
        </p>
      </div>

      <div className="space-y-6 text-sm text-text-secondary leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-text-primary">
            1. Why We Use Cookies
          </h2>
          <p>
            Venture Atlas utilizes strictly necessary cookies and local storage keys to maintain your authentication session, preserve your visual accessibility preferences (theme, dyslexia font, audio speed), and cache reading bookmarks.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-text-primary">
            2. Cookies & Storage Inventory
          </h2>
          <div className="border border-border rounded-2xl overflow-hidden text-xs font-mono">
            <table className="w-full text-left">
              <thead className="bg-surface-muted border-b border-border text-text-primary">
                <tr>
                  <th className="p-3">Identifier</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Purpose</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                <tr>
                  <td className="p-3 font-bold text-text-primary">va_reader</td>
                  <td className="p-3">HTTP-only Cookie</td>
                  <td className="p-3">HMAC-signed reader device identifier for news wire access</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-text-primary">sb-access-token</td>
                  <td className="p-3">HTTP-only Cookie</td>
                  <td className="p-3">Verified Supabase Auth staff editorial session</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-text-primary">va_theme</td>
                  <td className="p-3">LocalStorage</td>
                  <td className="p-3">Persists Dark/Light visual appearance preference</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-text-primary">va_bookmarked_stories</td>
                  <td className="p-3">LocalStorage</td>
                  <td className="p-3">Temporary offline bookmark cache</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
