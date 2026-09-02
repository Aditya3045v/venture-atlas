'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Shield, ArrowRight, Lock, CheckCircle2, Loader2, Sparkles, Zap, Flame } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

export const WelcomeOverlay: React.FC = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();

  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [fading, setFading] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Don't show gate on admin routes or auth pages
    if (pathname.startsWith('/admin') || pathname === '/imprint' || pathname === '/privacy' || pathname === '/terms') {
      setIsOpen(false);
      return;
    }

    // Check if user has already entered their email
    const hasReaderCookie = document.cookie.includes('va_reader=');
    const hasLocalKey = localStorage.getItem('va_reader_verified') === 'true';

    if (!hasReaderCookie && !hasLocalKey) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  }, [pathname]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast('Please enter a valid work or personal email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reader/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source: 'WELCOME_GATE' }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess(true);
        localStorage.setItem('va_reader_verified', 'true');
        localStorage.setItem('va_reader_email', email.trim().toLowerCase());
        toast('Welcome to Venture Atlas! Feed unlocked.', 'success');

        // Smooth transition to homepage
        setTimeout(() => {
          setFading(true);
          setTimeout(() => {
            setIsOpen(false);
            if (pathname !== '/') {
              router.push('/');
            }
          }, 450);
        }, 600);
      } else {
        toast(data.error || 'Failed to initialize access', 'error');
      }
    } catch {
      toast('Network connection error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!mounted || !isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl transition-all duration-500 select-none ${
        fading ? 'opacity-0 scale-98 pointer-events-none' : 'opacity-100 scale-100'
      }`}
      role="dialog"
      aria-modal="true"
    >
      {/* Ambient background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-lg bg-surface/95 dark:bg-[#0c0d0e]/95 border border-border/80 rounded-3xl p-6 sm:p-10 shadow-2xl space-y-6 text-center animate-scaleUp backdrop-blur-xl">
        {/* Brand Logo & Headline */}
        <div className="space-y-3">
          <div className="flex justify-center">
            <img
              src="/logo-dark.png"
              alt="Venture Atlas"
              className="hidden dark:block h-12 sm:h-14 w-auto object-contain drop-shadow-md"
            />
            <img
              src="/logo-light.png"
              alt="Venture Atlas"
              className="block dark:hidden h-12 sm:h-14 w-auto object-contain drop-shadow-md"
            />
          </div>

          <div className="space-y-1.5 pt-2">
            <h1 className="text-xl sm:text-2xl font-black font-display tracking-tight text-text-primary uppercase">
              Executive Venture Intelligence
            </h1>
            <p className="text-xs sm:text-sm font-mono text-amber-500 font-bold flex items-center justify-center gap-1.5">
              <Zap size={14} className="fill-current" />
              <span>Strictly 60-Word Briefs · Real-Time Deal Flow</span>
            </p>
          </div>

          <p className="text-xs font-body text-text-secondary max-w-sm mx-auto leading-relaxed">
            Enter your email to unlock unrestricted access to daily startup rounds, confidential post-mortems, and venture architecture teardowns.
          </p>
        </div>

        {/* Access Form */}
        {success ? (
          <div className="p-5 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono font-bold flex items-center justify-center gap-2 animate-fadeIn">
            <CheckCircle2 size={18} />
            <span>Clearance Verified. Bringing you to the live dispatch...</span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="colleague@firm.com"
                required
                autoFocus
                className="w-full pl-4 pr-12 py-3.5 rounded-2xl bg-surface-muted/90 border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-400 font-mono transition-all shadow-inner"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Clearance...</span>
                </>
              ) : (
                <>
                  <span>Enter Venture Atlas</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Value Proposition Badges */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-border/60">
          <div className="p-2 rounded-xl bg-surface-muted/60 text-center">
            <div className="text-[10px] font-mono font-bold text-text-primary uppercase">No Passwords</div>
            <div className="text-[9px] font-mono text-text-tertiary mt-0.5">Instant Entry</div>
          </div>
          <div className="p-2 rounded-xl bg-surface-muted/60 text-center">
            <div className="text-[10px] font-mono font-bold text-text-primary uppercase">60-Word Max</div>
            <div className="text-[9px] font-mono text-text-tertiary mt-0.5">Zero Fluff</div>
          </div>
          <div className="p-2 rounded-xl bg-surface-muted/60 text-center">
            <div className="text-[10px] font-mono font-bold text-text-primary uppercase">Audio Dispatch</div>
            <div className="text-[9px] font-mono text-text-tertiary mt-0.5">Synthesized Voice</div>
          </div>
        </div>

        {/* Staff Login Link */}
        <div className="pt-2 flex items-center justify-center gap-2 text-xs font-mono text-text-tertiary">
          <span>Editorial staff member?</span>
          <Link
            href="/admin/login"
            className="text-text-primary font-bold hover:text-amber-500 transition-colors underline flex items-center gap-1"
          >
            <span>Staff Password Login</span>
            <ArrowRight size={12} />
          </Link>
        </div>
      </div>
    </div>
  );
};
