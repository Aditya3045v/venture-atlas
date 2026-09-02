'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  UserCircle,
  Shield,
  Bookmark,
  LogOut,
  Mail,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  BellOff,
  BellRing,
} from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

interface AccountViewClientProps {
  initialData: {
    type: 'STAFF' | 'READER' | 'ANONYMOUS';
    staffUser?: {
      id: string;
      email: string;
      name: string;
      role: string;
      createdAt: string;
    } | null;
    reader?: {
      email: string;
      readerId: string;
      status: string;
      createdAt?: string;
    } | null;
    bookmarkCount: number;
    articleCount?: number;
  };
}

export const AccountViewClient: React.FC<AccountViewClientProps> = ({ initialData }) => {
  const { toast } = useToast();
  const router = useRouter();

  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState('');

  // Staff Sign Out
  const handleStaffSignOut = async () => {
    setLoading(true);
    try {
      window.location.href = '/admin/signout';
    } catch {
      toast('Failed to sign out', 'error');
      setLoading(false);
    }
  };

  // Reader Disconnect / Clear Session
  const handleReaderDisconnect = async () => {
    setLoading(true);
    try {
      // Clear va_reader cookie by setting expired cookie
      document.cookie = 'va_reader=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT; SameSite=Lax';
      toast('Reader session disconnected', 'info');
      router.refresh();
      setData({ type: 'ANONYMOUS', bookmarkCount: 0 });
    } catch {
      toast('Failed to disconnect session', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Reader Unsubscribe / Re-subscribe
  const handleToggleSubscription = async () => {
    if (!data.reader?.email) return;
    const isCurrentlySubscribed = data.reader.status !== 'UNSUBSCRIBED';
    setLoading(true);

    try {
      if (isCurrentlySubscribed) {
        // Unsubscribe
        const res = await fetch('/api/newsletter/unsubscribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.reader.email }),
        });
        if (res.ok) {
          toast('You have been unsubscribed from newsletter briefings', 'info');
          setData(prev => ({
            ...prev,
            reader: prev.reader ? { ...prev.reader, status: 'UNSUBSCRIBED' } : null,
          }));
        } else {
          throw new Error('Unsubscribe request failed');
        }
      } else {
        // Re-subscribe via reader/enter
        const res = await fetch('/api/reader/enter', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: data.reader.email, source: 'ACCOUNT_PAGE' }),
        });
        if (res.ok) {
          toast('Successfully re-subscribed to executive briefings', 'success');
          setData(prev => ({
            ...prev,
            reader: prev.reader ? { ...prev.reader, status: 'ACTIVE' } : null,
          }));
        } else {
          throw new Error('Re-subscription failed');
        }
      }
    } catch (err: any) {
      toast(err.message || 'Operation failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Anonymous user connects email
  const handleConnectEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim() || !emailInput.includes('@')) {
      toast('Please enter a valid email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reader/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailInput.trim(), source: 'ACCOUNT_CONNECT' }),
      });

      const resJson = await res.json();
      if (res.ok) {
        toast('Connected! Welcome to Venture Atlas', 'success');
        router.refresh();
      } else {
        throw new Error(resJson.error || 'Failed to connect email');
      }
    } catch (err: any) {
      toast(err.message || 'Error connecting account', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* CASE 1: STAFF USER */}
      {data.type === 'STAFF' && data.staffUser && (
        <>
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center font-display font-black text-2xl shadow-sm">
                {data.staffUser.name
                  .split(' ')
                  .map(p => p[0])
                  .join('')
                  .toUpperCase()
                  .slice(0, 2)}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl font-black font-display text-text-primary uppercase tracking-tight">
                    {data.staffUser.name}
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-brand/10 text-brand border border-brand/20">
                    {data.staffUser.role}
                  </span>
                </div>
                <p className="text-xs font-mono text-text-tertiary mt-0.5">
                  {data.staffUser.email} · Staff Member since {new Date(data.staffUser.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-text-primary text-background text-xs font-mono font-bold uppercase hover:opacity-90 transition-opacity shadow-sm active:scale-95"
              >
                <Shield size={14} />
                <span>Admin CMS</span>
              </Link>
              <button
                onClick={handleStaffSignOut}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface border border-red-500/30 text-red-500 text-xs font-mono font-bold uppercase hover:bg-red-500/10 transition-colors shadow-sm active:scale-95"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </div>

          {/* Real Metrics Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link
              href="/bookmarks"
              className="p-5 rounded-2xl border border-border bg-surface hover:bg-surface-muted/50 transition-colors shadow-card flex items-center justify-between"
            >
              <div>
                <div className="text-2xl font-black font-mono text-text-primary">
                  {data.bookmarkCount}
                </div>
                <div className="text-xs font-mono uppercase text-text-tertiary mt-1 flex items-center gap-1.5">
                  <Bookmark size={13} className="text-brand" />
                  <span>Saved Bookmarks</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-text-tertiary" />
            </Link>

            <Link
              href="/admin/articles"
              className="p-5 rounded-2xl border border-border bg-surface hover:bg-surface-muted/50 transition-colors shadow-card flex items-center justify-between"
            >
              <div>
                <div className="text-2xl font-black font-mono text-text-primary">
                  {data.articleCount ?? 0}
                </div>
                <div className="text-xs font-mono uppercase text-text-tertiary mt-1 flex items-center gap-1.5">
                  <Shield size={13} className="text-brand" />
                  <span>Staff Authored Briefs</span>
                </div>
              </div>
              <ArrowRight size={16} className="text-text-tertiary" />
            </Link>
          </div>
        </>
      )}

      {/* CASE 2: REGISTERED EXECUTIVE READER */}
      {data.type === 'READER' && data.reader && (
        <>
          <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-6">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-amber-400/10 border border-amber-400/20 text-amber-500 flex items-center justify-center font-display font-black text-xl">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-lg sm:text-xl font-bold font-display text-text-primary">
                      {data.reader.email}
                    </h1>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${
                        data.reader.status !== 'UNSUBSCRIBED'
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                      }`}
                    >
                      {data.reader.status !== 'UNSUBSCRIBED' ? 'SUBSCRIBED' : 'UNSUBSCRIBED'}
                    </span>
                  </div>
                  <p className="text-xs font-mono text-text-tertiary mt-0.5">
                    Executive Reader Access · Active Session
                  </p>
                </div>
              </div>

              <button
                onClick={handleReaderDisconnect}
                disabled={loading}
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-border bg-surface-muted text-text-secondary hover:text-text-primary text-xs font-mono uppercase transition-colors"
                title="Disconnect cookie session on this device"
              >
                <LogOut size={13} />
                <span>Disconnect</span>
              </button>
            </div>

            {/* Reader Controls */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Link
                href="/bookmarks"
                className="p-4 rounded-xl border border-border bg-surface-muted/40 hover:bg-surface-muted transition-colors flex items-center justify-between"
              >
                <div>
                  <div className="text-xl font-black font-mono text-text-primary">
                    {data.bookmarkCount}
                  </div>
                  <div className="text-xs font-mono uppercase text-text-tertiary mt-0.5 flex items-center gap-1.5">
                    <Bookmark size={13} />
                    <span>Saved Bookmarks</span>
                  </div>
                </div>
                <ArrowRight size={15} className="text-text-tertiary" />
              </Link>

              <div className="p-4 rounded-xl border border-border bg-surface-muted/40 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono font-bold uppercase text-text-primary">
                    Daily Briefing Newsletter
                  </div>
                  <div className="text-[11px] text-text-tertiary mt-0.5">
                    {data.reader.status !== 'UNSUBSCRIBED'
                      ? 'Receiving daily 60-word deals wrap'
                      : 'Unsubscribed from automated mailings'}
                  </div>
                </div>
                <button
                  onClick={handleToggleSubscription}
                  disabled={loading}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase transition-colors ${
                    data.reader.status !== 'UNSUBSCRIBED'
                      ? 'border border-red-500/30 text-red-500 hover:bg-red-500/10'
                      : 'bg-text-primary text-background hover:opacity-90'
                  }`}
                >
                  {data.reader.status !== 'UNSUBSCRIBED' ? 'Unsubscribe' : 'Re-subscribe'}
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* CASE 3: ANONYMOUS VISITOR */}
      {data.type === 'ANONYMOUS' && (
        <div className="p-6 sm:p-10 rounded-2xl border border-border bg-surface shadow-card space-y-6">
          <div className="text-center max-w-md mx-auto space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center mx-auto mb-3">
              <UserCircle size={28} />
            </div>
            <h1 className="text-xl sm:text-2xl font-black font-display text-text-primary uppercase tracking-tight">
              Executive Reader Access
            </h1>
            <p className="text-xs font-mono text-text-tertiary">
              Connect your email to synchronize bookmarks across devices and receive daily 60-word deal briefings.
            </p>
          </div>

          <form onSubmit={handleConnectEmail} className="max-w-md mx-auto space-y-3">
            <div className="flex flex-col sm:flex-row gap-2">
              <input
                type="email"
                value={emailInput}
                onChange={e => setEmailInput(e.target.value)}
                placeholder="colleague@firm.com"
                required
                className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-surface-muted text-sm text-text-primary focus:outline-none focus:border-brand"
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-text-primary text-background font-mono font-bold text-xs uppercase hover:opacity-90 transition-opacity shrink-0"
              >
                {loading ? 'Connecting...' : 'Connect Access'}
              </button>
            </div>
            <p className="text-[11px] font-mono text-text-tertiary text-center">
              Frictionless access · No password required · Instant activation
            </p>
          </form>

          <div className="pt-6 border-t border-border flex items-center justify-between text-xs font-mono text-text-tertiary">
            <span>Are you a Venture Atlas staff editor?</span>
            <Link href="/admin/login" className="text-text-primary font-bold hover:underline flex items-center gap-1">
              <span>Staff Login</span>
              <ArrowRight size={12} />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};
