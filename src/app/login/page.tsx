'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, Lock, Mail, KeyRound, ArrowRight } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/providers/ToastProvider';

const DEMO_ACCOUNTS = [
  { role: 'ADMIN', name: 'Alex Rivera', email: 'admin@ventureatlas.io', desc: 'Full publishing & system control' },
  { role: 'EDITOR', name: 'Sarah Chen', email: 'editor@ventureatlas.io', desc: 'Review, schedule & publish' },
  { role: 'AUTHOR', name: 'Devon Scott', email: 'author@ventureatlas.io', desc: 'Create & submit drafts' },
  { role: 'USER', name: 'Priya Mehta', email: 'reader@ventureatlas.io', desc: 'Reader & personal bookmarks' },
];

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast('Please enter your email', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, mfaCode }),
      });
      const data = await res.json();

      if (res.ok) {
        toast(`Signed in as ${data.user?.name} (${data.user?.role})`, 'success');
        if (data.user?.role === 'ADMIN' || data.user?.role === 'EDITOR' || data.user?.role === 'AUTHOR') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      } else {
        toast(data.error || 'Authentication failed', 'error');
      }
    } catch (err) {
      toast('An error occurred during authentication', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSelect = async (accountEmail: string) => {
    setEmail(accountEmail);
    setPassword('demo-password-123');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: accountEmail }),
      });
      const data = await res.json();
      if (res.ok) {
        toast(`Switched to ${data.user?.name} (${data.user?.role})`, 'success');
        if (data.user?.role === 'ADMIN' || data.user?.role === 'EDITOR' || data.user?.role === 'AUTHOR') {
          router.push('/admin');
        } else {
          router.push('/');
        }
      }
    } catch {
      toast('Failed to sign in', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto py-8 space-y-6">
      <div className="text-center space-y-3">
        <div className="flex justify-center">
          <img
            src="/logo-dark.png"
            alt="Venture Atlas"
            className="hidden dark:block h-10 w-auto object-contain"
          />
          <img
            src="/logo-light.png"
            alt="Venture Atlas"
            className="block dark:hidden h-10 w-auto object-contain"
          />
        </div>
        <p className="text-xs font-mono text-text-tertiary">
          Access your personal reading library or the editorial publishing panel.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="p-6 sm:p-8 rounded-3xl border border-border/80 bg-surface shadow-card space-y-5">
        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="alex@ventureatlas.io"
            leftIcon={<Mail size={16} />}
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="••••••••••••"
            leftIcon={<Lock size={16} />}
          />

          {email.includes('admin') && (
            <Input
              label="MFA Authenticator Code (6-digits)"
              type="text"
              maxLength={6}
              value={mfaCode}
              onChange={e => setMfaCode(e.target.value)}
              placeholder="123456"
              leftIcon={<KeyRound size={16} />}
              helperText="MFA is required for privileged administrator roles."
            />
          )}

          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            <span>Authenticate Session</span>
            <ArrowRight size={14} />
          </Button>
        </form>
      </div>

      {/* 1-Click Role Switcher */}
      <div className="p-5 rounded-3xl border border-border/70 bg-surface-muted/60 space-y-3">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
          <Shield size={14} className="text-text-primary" />
          <span>Quick-Switch Demo Accounts:</span>
        </div>

        <div className="space-y-2">
          {DEMO_ACCOUNTS.map(acc => (
            <button
              key={acc.email}
              type="button"
              onClick={() => handleQuickSelect(acc.email)}
              className="w-full p-2.5 rounded-2xl border border-border/70 bg-surface hover:border-border text-left transition-all flex items-center justify-between group active:scale-98"
            >
              <div>
                <div className="text-xs font-bold text-text-primary flex items-center gap-1.5">
                  <span>{acc.name}</span>
                  <span className="px-2 py-0.2 rounded-full text-[9px] font-mono font-bold uppercase bg-surface-muted text-text-primary border border-border/60">
                    {acc.role}
                  </span>
                </div>
                <div className="text-[10px] font-mono text-text-tertiary">{acc.desc}</div>
              </div>
              <span className="text-xs font-mono font-bold text-text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                Switch →
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
