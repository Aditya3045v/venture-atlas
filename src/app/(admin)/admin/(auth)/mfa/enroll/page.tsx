'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Key, Copy, Check, AlertTriangle, ArrowRight } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

export default function MFAEnrollPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [factorId, setFactorId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [recoveryCodes, setRecoveryCodes] = useState<string[]>([]);
  const [verificationCode, setVerificationCode] = useState('');
  const [copiedSecret, setCopiedSecret] = useState(false);
  const [copiedCodes, setCopiedCodes] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function initEnrollment() {
      try {
        setLoading(true);
        const res = await fetch('/api/admin/mfa/enroll', { method: 'POST' });
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || 'Failed to initialize MFA enrollment');
        }

        setFactorId(data.factorId);
        setQrCode(data.qrCode);
        setSecret(data.secret);
        setRecoveryCodes(data.recoveryCodes || []);
      } catch (err: any) {
        setError(err.message || 'Error setting up MFA');
      } finally {
        setLoading(false);
      }
    }

    initEnrollment();
  }, []);

  const handleCopySecret = () => {
    if (secret) {
      navigator.clipboard.writeText(secret);
      setCopiedSecret(true);
      setTimeout(() => setCopiedSecret(false), 2000);
    }
  };

  const handleCopyCodes = () => {
    if (recoveryCodes.length > 0) {
      navigator.clipboard.writeText(recoveryCodes.join('\n'));
      setCopiedCodes(true);
      setTimeout(() => setCopiedCodes(false), 2000);
    }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationCode || verificationCode.length !== 6 || !factorId) {
      setError('Please enter a valid 6-digit authenticator code.');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const res = await fetch('/api/admin/mfa/challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          factorId,
          code: verificationCode,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed. Please check the code.');
      }

      router.push('/admin');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-xs font-mono text-text-tertiary animate-pulse">
          INITIALIZING SECURE MFA ENROLLMENT...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="w-12 h-12 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand">
            <ShieldCheck size={28} />
          </div>
        </div>
        <h2 className="mt-4 text-center text-2xl font-black font-display uppercase tracking-tight text-text-primary">
          Mandatory MFA Enrollment
        </h2>
        <p className="mt-1 text-center text-xs font-mono text-text-tertiary">
          EDITOR & ADMIN accounts require Two-Factor Authentication (TOTP).
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-lg">
        <div className="bg-surface py-8 px-6 sm:px-10 rounded-2xl border border-border shadow-card space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono flex items-start gap-2">
              <AlertTriangle size={16} className="shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Step 1: Scan QR Code */}
          <div className="space-y-3">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[10px]">
                1
              </span>
              <span>Scan Authenticator QR Code</span>
            </div>
            <p className="text-xs text-text-secondary">
              Scan this QR code with your authenticator app (Google Authenticator, 1Password, Authy).
            </p>

            {qrCode && (
              <div className="flex justify-center p-4 bg-white rounded-xl border border-border">
                <img src={qrCode} alt="TOTP QR Code" className="w-48 h-48" />
              </div>
            )}

            {secret && (
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-surface-muted border border-border font-mono text-xs text-text-secondary">
                <span className="truncate mr-2 select-all font-bold text-text-primary">{secret}</span>
                <button
                  type="button"
                  onClick={handleCopySecret}
                  className="px-2.5 py-1 rounded-lg bg-surface border border-border text-[11px] font-bold uppercase flex items-center gap-1 hover:text-text-primary transition-colors shrink-0"
                >
                  {copiedSecret ? <Check size={12} className="text-emerald-500" /> : <Copy size={12} />}
                  <span>{copiedSecret ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Step 2: Emergency Recovery Codes */}
          {recoveryCodes.length > 0 && (
            <div className="space-y-3 pt-4 border-t border-border">
              <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[10px]">
                  2
                </span>
                <span>Save Emergency Recovery Codes</span>
              </div>
              <p className="text-xs text-text-secondary">
                Keep these one-time codes in a safe place. You will need them if you lose your authenticator.
              </p>

              <div className="p-3 rounded-xl bg-surface-muted border border-border space-y-2">
                <div className="grid grid-cols-2 gap-1.5 font-mono text-xs text-text-primary">
                  {recoveryCodes.map((code, idx) => (
                    <div key={idx} className="p-1 rounded bg-surface border border-border/50 text-center font-bold">
                      {code}
                    </div>
                  ))}
                </div>

                <div className="flex justify-end pt-2">
                  <button
                    type="button"
                    onClick={handleCopyCodes}
                    className="px-3 py-1 rounded-lg bg-surface border border-border text-xs font-mono font-bold uppercase flex items-center gap-1.5 hover:text-text-primary transition-colors"
                  >
                    {copiedCodes ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                    <span>{copiedCodes ? 'All Codes Copied' : 'Copy All Codes'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Verify and Activate */}
          <form onSubmit={handleVerify} className="space-y-4 pt-4 border-t border-border">
            <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
              <span className="w-5 h-5 rounded-full bg-surface-muted border border-border flex items-center justify-center text-[10px]">
                3
              </span>
              <span>Verify 6-Digit Code</span>
            </div>

            <div>
              <label htmlFor="code" className="sr-only">
                6-Digit Authenticator Code
              </label>
              <input
                id="code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/[^0-9]/g, ''))}
                placeholder="123456"
                className="w-full text-center text-2xl font-mono tracking-widest py-3 px-4 rounded-xl border border-border bg-surface-muted text-text-primary focus:outline-hidden focus:ring-2 focus:ring-brand"
                required
              />
            </div>

            <button
              type="submit"
              disabled={submitting || verificationCode.length !== 6}
              className="w-full py-3 px-4 rounded-xl bg-text-primary text-background font-mono font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 transition-opacity"
            >
              {submitting ? 'Verifying...' : 'Activate MFA & Enter Dashboard'}
              <ArrowRight size={14} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
