'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldAlert, KeyRound, ArrowRight, AlertTriangle, RefreshCw } from 'lucide-react';

function MFAChallengeForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/admin';

  const [mode, setMode] = useState<'totp' | 'recovery'>('totp');
  const [totpCode, setTotpCode] = useState('');
  const [recoveryCode, setRecoveryCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      const { createBrowserClient } = await import('@supabase/ssr');
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      if (mode === 'totp') {
        const { data: factors } = await supabase.auth.mfa.listFactors();
        const totpFactor = factors?.totp?.[0];

        if (!totpFactor) {
          throw new Error('No enrolled TOTP factor found. Please re-enroll.');
        }

        const res = await fetch('/api/admin/mfa/challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            factorId: totpFactor.id,
            code: totpCode,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid authenticator code.');
        }
      } else {
        const res = await fetch('/api/admin/mfa/challenge', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            recoveryCode,
          }),
        });

        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid recovery code.');
        }
      }

      router.push(returnTo);
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'MFA challenge failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
            <ShieldAlert size={28} />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black font-display uppercase tracking-tight text-text-primary">
          Two-Factor Challenge
        </h2>
        <p className="mt-1 text-center text-xs font-mono text-text-tertiary">
          {mode === 'totp'
            ? 'Enter the 6-digit code from your authenticator app.'
            : 'Enter an emergency one-time recovery code.'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-surface py-8 px-6 sm:px-10 rounded-2xl border border-border shadow-card space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {mode === 'totp' ? (
              <div>
                <label htmlFor="totpCode" className="sr-only">
                  6-Digit Authenticator Code
                </label>
                <input
                  id="totpCode"
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  value={totpCode}
                  onChange={(e) => setTotpCode(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="123456"
                  className="w-full text-center text-3xl font-mono tracking-widest py-3 px-4 rounded-xl border border-border bg-surface-muted text-text-primary focus:outline-hidden focus:ring-2 focus:ring-brand"
                  autoFocus
                  required
                />
              </div>
            ) : (
              <div>
                <label htmlFor="recoveryCode" className="block text-xs font-mono font-bold uppercase text-text-secondary mb-1">
                  Recovery Code (XXXX-XXXX)
                </label>
                <input
                  id="recoveryCode"
                  type="text"
                  value={recoveryCode}
                  onChange={(e) => setRecoveryCode(e.target.value.toUpperCase())}
                  placeholder="A1B2-C3D4"
                  className="w-full text-center text-xl font-mono tracking-wider py-3 px-4 rounded-xl border border-border bg-surface-muted text-text-primary focus:outline-hidden focus:ring-2 focus:ring-brand"
                  autoFocus
                  required
                />
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || (mode === 'totp' ? totpCode.length !== 6 : !recoveryCode)}
              className="w-full py-3 px-4 rounded-xl bg-text-primary text-background font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? 'Authenticating...' : 'Verify & Continue'}
              <ArrowRight size={14} />
            </button>
          </form>

          <div className="pt-4 border-t border-border text-center">
            {mode === 'totp' ? (
              <button
                type="button"
                onClick={() => {
                  setMode('recovery');
                  setError(null);
                }}
                className="text-xs font-mono text-text-tertiary hover:text-text-primary transition-colors flex items-center justify-center gap-1.5 mx-auto"
              >
                <KeyRound size={13} />
                <span>Use Emergency Recovery Code</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setMode('totp');
                  setError(null);
                }}
                className="text-xs font-mono text-text-tertiary hover:text-text-primary transition-colors flex items-center justify-center gap-1.5 mx-auto"
              >
                <RefreshCw size={13} />
                <span>Use Authenticator App Code</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function MFAChallengePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-xs font-mono text-text-tertiary animate-pulse">LOADING SECURITY GATEWAY...</div>
      </div>
    }>
      <MFAChallengeForm />
    </Suspense>
  );
}
