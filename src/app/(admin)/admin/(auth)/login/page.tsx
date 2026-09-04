'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Shield, Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

function AdminLoginForm() {
  const searchParams = useSearchParams();
  const returnTo = searchParams.get('returnTo') || '/admin';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrorMsg('Please enter both email and access key.');
      return;
    }

    setLoading(true);
    setErrorMsg(null);

    try {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      // 1. Sign in with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (authError || !authData.user) {
        setErrorMsg('Invalid login credentials or clearance rejected.');
        setLoading(false);
        return;
      }

      // 2. Query user profile to verify staff role
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single();

      if (profileError || !profile || !['WRITER', 'EDITOR', 'ADMIN'].includes(profile.role)) {
        await supabase.auth.signOut();
        setErrorMsg('This account does not have editorial access.');
        setLoading(false);
        return;
      }

      // 3. Successful login - redirect to returnTo or /admin
      window.location.href = returnTo;
    } catch {
      setErrorMsg('An authentication error occurred. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-6 px-4 py-12 select-none">
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-amber-400/10 text-amber-500 border border-amber-400/20 mb-2">
            <Shield size={28} />
          </div>
          <h1 className="text-2xl font-black font-display tracking-tight text-text-primary uppercase">
            Editorial Security Clearance
          </h1>
          <p className="text-xs font-mono text-text-tertiary">
            Staff Authentication & Publishing Access
          </p>
        </div>

        <div className="p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-card space-y-5">
          {errorMsg && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono flex items-center gap-2">
              <AlertCircle size={16} className="shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase text-text-secondary">
                Staff Identity / Email
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="editor@ventureatlas.in"
                  required
                  autoFocus
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-400 transition-colors"
                />
                <Mail size={16} className="absolute left-3.5 top-3 text-text-tertiary pointer-events-none" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-mono font-bold uppercase text-text-secondary">
                Access Key / Password
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface-muted border border-border text-sm text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-400 transition-colors"
                />
                <Lock size={16} className="absolute left-3.5 top-3 text-text-tertiary pointer-events-none" />
              </div>
            </div>

            <div className="flex items-center justify-between text-xs font-mono text-text-tertiary pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-border"
                />
                <span>Remember session</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-black font-bold font-mono text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying Credentials...</span>
                </>
              ) : (
                <span>Authenticate Clearance</span>
              )}
            </button>
          </form>
        </div>
    </div>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<div className="min-h-[80vh] flex items-center justify-center"><Loader2 className="animate-spin text-amber-400" /></div>}>
      <AdminLoginForm />
    </Suspense>
  );
}
