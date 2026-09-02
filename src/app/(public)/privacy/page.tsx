import React from 'react';
import Link from 'next/link';
import { Shield, Lock, Eye, Trash2, ArrowLeft } from 'lucide-react';

export const metadata = {
  title: 'Privacy Policy — Venture Atlas',
  description: 'Learn how Venture Atlas collects, retains, and protects reader data, and how to request data deletion.',
};

export default function PrivacyPolicyPage() {
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
          <Shield size={16} />
          <span>Privacy & Data Sovereignty</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-text-primary">
          Privacy Policy
        </h1>
        <p className="text-xs font-mono text-text-tertiary">
          Effective Date: September 1, 2026 · Last Updated: September 2026
        </p>
      </div>

      {/* Policy Content */}
      <div className="prose prose-slate dark:prose-invert max-w-none space-y-6 text-sm text-text-secondary leading-relaxed">
        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-text-primary">
            1. Overview & Commitment
          </h2>
          <p>
            Venture Atlas Media Inc. ("Venture Atlas", "we", "us") respects your privacy. This policy outlines the specific information we collect, how it is stored, how it is used to deliver our editorial intelligence briefings, and your absolute right to request complete deletion of your data at any time.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-text-primary">
            2. Personal Data We Collect
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Reader Email Address</strong>: Collected when you enter your email to unlock the 60-word feed or sign in via Supabase Auth.
            </li>
            <li>
              <strong>Reading Preferences & Interactions</strong>: Bookmarked articles, story applause (likes), font sizing, and dyslexia mode toggles stored to personalize your reader experience.
            </li>
            <li>
              <strong>Technical Telemetry</strong>: IP hash for fraud prevention and rate limiting, user-agent for responsive layout rendering, and session tokens encrypted in HTTP-only cookies.
            </li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-text-primary">
            3. Data Retention & Third-Party Sharing
          </h2>
          <p>
            We do not sell, rent, or trade your personal email address or reading telemetry to ad networks, data brokers, or third parties. Data is stored in enterprise-grade PostgreSQL with Row-Level Security (RLS) enforcement.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-text-primary">
            4. Your Rights & Account Deletion (GDPR / CCPA)
          </h2>
          <p>
            Under GDPR, CCPA, and global privacy standards, you have the right to inspect, export, or permanently delete all data associated with your profile.
          </p>
          <div className="p-4 rounded-2xl bg-surface-muted border border-border flex items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="font-bold text-xs font-mono uppercase text-text-primary">
                Instant Account & Data Deletion
              </div>
              <div className="text-xs text-text-tertiary">
                You can permanently erase your profile and bookmarks in your Account Portal.
              </div>
            </div>
            <Link
              href="/account"
              className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-mono font-bold shrink-0 transition-colors"
            >
              Account Settings
            </Link>
          </div>
        </section>

        <section className="space-y-3">
          <h2 className="text-xl font-bold font-display text-text-primary">
            5. Editorial Contact & Data Officer
          </h2>
          <p>
            For privacy inquiries, GDPR data requests, or formal communications, contact our Data Protection Officer at:
          </p>
          <div className="p-4 rounded-xl border border-border font-mono text-xs text-text-primary bg-surface">
            privacy@ventureatlas.io · Venture Atlas Media Inc., 548 Market St, San Francisco, CA 94104
          </div>
        </section>
      </div>
    </div>
  );
}
