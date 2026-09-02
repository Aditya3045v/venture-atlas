'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/components/providers/ThemeProvider';
import { Switch } from '@/components/ui/Switch';
import { useToast } from '@/components/providers/ToastProvider';
import { UserCircle, Shield, Bell, Flame, Bookmark, BookOpen, LogOut, Check } from 'lucide-react';
import { UserProfile } from '@/types';

export default function AccountPage() {
  const { isDark, toggleTheme } = useTheme();
  const { toast } = useToast();
  const router = useRouter();

  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [morningDigest, setMorningDigest] = useState(true);
  const [eveningDigest, setEveningDigest] = useState(true);
  const [breakingNews, setBreakingNews] = useState(false);
  const [dataSaver, setDataSaver] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  useEffect(() => {
    // Check current session
    async function loadUser() {
      try {
        const res = await fetch('/api/auth');
        if (res.ok) {
          const data = await res.json();
          if (data.user) setUser(data.user);
        }
      } catch (err) {
        console.error('Failed to load user:', err);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  const handleSignOut = async () => {
    setSigningOut(true);
    try {
      await fetch('/api/auth/signout', { method: 'POST' });
      toast('Signed out successfully', 'success');
      router.push('/login');
      router.refresh();
    } catch (err) {
      toast('Failed to sign out', 'error');
    } finally {
      setSigningOut(false);
    }
  };

  const displayName = user?.name || 'Alex Rivera';
  const displayEmail = user?.email || 'admin@ventureatlas.io';
  const displayRole = user?.role || 'ADMIN';
  const initials = displayName
    .split(' ')
    .map(p => p[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const isStaff = displayRole === 'ADMIN' || displayRole === 'EDITOR' || displayRole === 'WRITER' || (displayRole as any) === 'AUTHOR';

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-brand text-white flex items-center justify-center font-display font-black text-2xl shadow-sm">
            {initials}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black font-display text-text-primary uppercase tracking-tight">
                {displayName}
              </h1>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
                {user?.plan || 'PRO MEMBER'}
              </span>
            </div>
            <p className="text-xs font-mono text-text-tertiary mt-0.5">
              {displayEmail} · {displayRole} ACCOUNT
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {isStaff && (
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand text-white text-xs font-mono font-bold uppercase hover:bg-brand-strong transition-colors shadow-sm"
            >
              <Shield size={14} />
              <span>Open Admin CMS</span>
            </Link>
          )}
          <button
            onClick={handleSignOut}
            disabled={signingOut}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-border text-text-secondary text-xs font-mono font-bold uppercase hover:text-red-500 hover:border-red-500/40 transition-colors shadow-sm"
          >
            <LogOut size={14} />
            <span>{signingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
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
              onChange={(v: boolean) => {
                setMorningDigest(v);
                toast(`Morning digest ${v ? 'enabled' : 'disabled'}`, 'info');
              }}
              label="07:00 AM Morning Executive Briefing"
              description="Daily 60-word digest of overnight rounds, stealth launches and venture deal flow."
            />
          </div>

          <div className="pt-5">
            <Switch
              checked={eveningDigest}
              onChange={(v: boolean) => {
                setEveningDigest(v);
                toast(`Evening digest ${v ? 'enabled' : 'disabled'}`, 'info');
              }}
              label="06:00 PM Markets & Valuations Wrap"
              description="Secondary liquidity movements, IPO signals, and macro teardowns."
            />
          </div>

          <div className="pt-5">
            <Switch
              checked={breakingNews}
              onChange={(v: boolean) => {
                setBreakingNews(v);
                toast(`Breaking wire alerts ${v ? 'enabled' : 'disabled'}`, 'info');
              }}
              label="Breaking Wire Notifications"
              description="Instant alerts for Series C+ rounds ($100M+) and top-tier M&A deals."
            />
          </div>

          <div className="pt-5">
            <Switch
              checked={dataSaver}
              onChange={(v: boolean) => {
                setDataSaver(v);
                toast(`Low-bandwidth mode ${v ? 'enabled' : 'disabled'}`, 'info');
              }}
              label="Low-Bandwidth Mobile Terminal Mode"
              description="Disable cover graphics and load pure monospace text for rapid offline reading."
            />
          </div>
        </div>
      </div>
    </div>
  );
}
