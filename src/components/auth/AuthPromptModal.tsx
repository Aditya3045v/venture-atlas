'use client';

import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { X, Lock, ArrowRight, ShieldCheck, Heart, Bookmark, MessageSquare, Loader2, CheckCircle2 } from 'lucide-react';
import { useToast } from '../providers/ToastProvider';

interface AuthPromptModalProps {
  isOpen: boolean;
  onClose: () => void;
  action?: 'like' | 'bookmark' | 'comment';
  onSuccess?: () => void;
}

export const AuthPromptModal: React.FC<AuthPromptModalProps> = ({
  isOpen,
  onClose,
  action = 'bookmark',
  onSuccess,
}) => {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!mounted || !isOpen) return null;

  const actionDetails = {
    like: {
      icon: <Heart className="w-7 h-7 text-rose-500 fill-rose-500/20" />,
      title: 'Enter Email to Like Briefs',
      desc: 'Unlock reader interactions on this device and applaud startup briefs.',
    },
    bookmark: {
      icon: <Bookmark className="w-7 h-7 text-amber-500 fill-amber-500/20" />,
      title: 'Save to Device Library',
      desc: 'Keep your reading queue organized and saved locally on this browser.',
    },
    comment: {
      icon: <MessageSquare className="w-7 h-7 text-blue-500 fill-blue-500/20" />,
      title: 'Submit Perspective for Review',
      desc: 'Enter your work email to submit insights for editorial moderation.',
    },
  }[action];

  const handleReaderEnter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast('Please enter a valid work email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/reader/enter', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), source: `MODAL_${action.toUpperCase()}` }),
      });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccess(true);
        toast('Access initialized for this browser', 'success');
        setTimeout(() => {
          onSuccess?.();
          onClose();
        }, 500);
      } else {
        toast(data.error || 'Failed to initialize access', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const modal = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-labelledby="auth-modal-title"
    >
      <div
        className="relative w-full max-w-md bg-surface border border-border/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-5 text-center animate-scaleUp"
        onClick={e => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-muted transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        <div className="w-14 h-14 rounded-2xl bg-surface-muted border border-border flex items-center justify-center mx-auto shadow-inner">
          {actionDetails.icon}
        </div>

        <div className="space-y-1.5">
          <h2 id="auth-modal-title" className="text-lg font-bold font-display text-text-primary">
            {actionDetails.title}
          </h2>
          <p className="text-xs font-body text-text-secondary leading-relaxed">
            {actionDetails.desc}
          </p>
        </div>

        {success ? (
          <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-xs font-mono font-bold flex items-center justify-center gap-2">
            <CheckCircle2 size={16} />
            <span>Reader access verified on this device!</span>
          </div>
        ) : (
          <form onSubmit={handleReaderEnter} className="space-y-3 pt-1">
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@company.com"
              required
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl bg-surface-muted border border-border text-xs text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-amber-400 font-mono"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:scale-98 text-black font-mono font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>Entering...</span>
                </>
              ) : (
                <>
                  <span>Continue</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </form>
        )}

        <div className="flex items-center justify-center gap-3 text-[10px] font-mono text-text-tertiary pt-1">
          <span className="flex items-center gap-1">
            <Lock size={11} className="text-emerald-500" /> Device-Scoped
          </span>
          <span>·</span>
          <span className="flex items-center gap-1">
            <ShieldCheck size={11} className="text-blue-500" /> No Spam Ever
          </span>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
