'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useTheme } from '../../components/providers/ThemeProvider';
import { Switch } from '../../components/ui/Switch';
import { useToast } from '../../components/providers/ToastProvider';
import { UserCircle, Shield, Bell, Flame, Bookmark, BookOpen, LogOut, Check } from 'lucide-react';

export default function AccountPage() {
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();

  const [morningDigest, setMorningDigest] = useState(true);
  const [eveningDigest, setEveningDigest] = useState(true);
  const [breakingNews, setBreakingNews] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand text-white flex items-center justify-center font-display font-black text-2xl shadow-sm">
            AR
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-display text-text-primary uppercase tracking-tight">
                Alex Rivera
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                PRO MEMBER
              </span>
            </div>
            <p className="text-xs font-mono text-text-tertiary mt-0.5">
              alex@ventureatlas.io · ADMIN ACCOUNT
            </p>
          </div>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-mono font-bold uppercase hover:bg-brand-strong transition-colors shadow-sm self-start sm:self-auto"
        >
          <Shield size={14} />
          <span>Open Admin CMS</span>
        </Link>
      </div>

      {/* 3 Reading Metrics */}
      <div className="grid grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-surface shadow-card text-center">
          <div className="text-2xl sm:text-3xl font-black font-display text-text-primary leading-none">
            18
          </div>
          <div className="text-[10px] font-mono font-bold text-text-tertiary uppercase mt-1.5 flex items-center justify-center gap-1">
            <Bookmark size={11} />
            <span>SAVED BRIEFS</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-card text-center">
          <div className="text-2xl sm:text-3xl font-black font-display text-text-primary leading-none">
            142
          </div>
          <div className="text-[10px] font-mono font-bold text-text-tertiary uppercase mt-1.5 flex items-center justify-center gap-1">
            <BookOpen size={11} />
            <span>READ (30D)</span>
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-card text-center">
          <div className="text-2xl sm:text-3xl font-black font-display text-text-primary leading-none">
            14
          </div>
          <div className="text-[10px] font-mono font-bold text-text-tertiary uppercase mt-1.5 flex items-center justify-center gap-1 text-amber-500">
            <Flame size={12} className="fill-current" />
            <span>DAY STREAK</span>
          </div>
        </div>
      </div>

      {/* Reading & Notification Preferences */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card space-y-6">
        <div className="border-b border-border pb-3">
          <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-text-primary">
            Reading & Notification Preferences
          </h2>
          <p className="text-xs text-text-tertiary mt-0.5">
            Configure your scheduled briefing alerts and visual display theme.
          </p>
        </div>

        <div className="space-y-5 divide-y divide-border">
          <div className="pt-2">
            <Switch
              checked={morningDigest}
              onChange={v => {
                setMorningDigest(v);
                toast(v ? 'Morning digest scheduled for 8:00 AM' : 'Morning digest disabled', 'info');
              }}
              label="Morning Executive Digest"
              description="Receive the 8:00 AM daily briefing of top overnight venture & funding deals."
            />
          </div>

          <div className="pt-5">
            <Switch
              checked={eveningDigest}
              onChange={v => {
                setEveningDigest(v);
                toast(v ? 'Evening digest scheduled for 7:30 PM' : 'Evening digest disabled', 'info');
              }}
              label="Evening Market Wrap"
              description="7:30 PM closing snapshot of public markets, tech valuations, and M&A."
            />
          </div>

          <div className="pt-5">
            <Switch
              checked={breakingNews}
              onChange={v => {
                setBreakingNews(v);
                toast(v ? 'Breaking news alerts enabled' : 'Breaking news alerts disabled', 'info');
              }}
              label="High-Impact Breaking Alerts"
              description="Real-time alerts for mega-acquisitions, IPO filings, and major policy rulings."
            />
          </div>

          <div className="pt-5">
            <Switch
              checked={dataSaver}
              onChange={v => setDataSaver(v)}
              label="Data Saver Mode"
              description="Load low-bandwidth thumbnail representations on metered connections."
            />
          </div>

          <div className="pt-5">
            <Switch
              checked={isDark}
              onChange={() => toggleTheme()}
              label="Dark Reading Mode"
              description="High-contrast dark ink mode for reduced eye strain during nocturnal reading."
            />
          </div>
        </div>
      </div>

      {/* Account Actions */}
      <div className="pt-2 flex items-center justify-between">
        <button
          onClick={() => toast('Session refreshed', 'info')}
          className="px-4 py-2 rounded-xl bg-surface border border-border text-xs font-mono font-bold uppercase text-text-secondary hover:text-text-primary transition-colors"
        >
          Reset Session Cache
        </button>

        <Link
          href="/login"
          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-300 border border-red-200 dark:border-red-800 text-xs font-mono font-bold uppercase hover:bg-red-100 transition-colors"
        >
          <LogOut size={13} />
          <span>Switch Account / Sign Out</span>
        </Link>
      </div>
    </div>
  );
}
