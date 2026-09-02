'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Copy, Check, Share2 } from 'lucide-react';
import { useToast } from '@/components/providers/ToastProvider';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
  summary?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url,
  summary,
}) => {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    toast('Link copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedSummary = encodeURIComponent(summary || title);

  const shareNetworks = [
    {
      name: 'X (Twitter)',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
      href: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      color: 'bg-black text-white hover:bg-neutral-800',
    },
    {
      name: 'LinkedIn',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
        </svg>
      ),
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      color: 'bg-[#0A66C2] text-white hover:bg-[#084e96]',
    },
    {
      name: 'WhatsApp',
      icon: (
        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
          <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2m.01 1.67c2.2 0 4.26.86 5.82 2.42a8.225 8.225 0 0 1 2.41 5.83c0 4.54-3.7 8.24-8.24 8.24-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.196 8.196 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.24-8.24m4.52 11.66c-.25-.13-1.47-.72-1.7-.81-.23-.08-.39-.13-.56.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.13-1.06-.39-2.03-1.25-.75-.67-1.26-1.5-1.41-1.75-.15-.25-.02-.39.11-.51.11-.11.25-.29.37-.44.13-.14.17-.25.25-.42.08-.17.04-.31-.02-.44-.06-.13-.56-1.35-.77-1.85-.2-.49-.41-.42-.56-.43h-.48c-.17 0-.44.06-.67.31-.23.25-.88.86-.88 2.1 0 1.24.9 2.44 1.03 2.61.13.17 1.77 2.71 4.3 3.8 2.52 1.09 2.52.73 2.98.69.46-.05 1.47-.6 1.68-1.18.21-.58.21-1.08.15-1.18-.06-.11-.23-.17-.48-.3z" />
        </svg>
      ),
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      color: 'bg-[#25D366] text-white hover:bg-[#1ebc59]',
    },
  ];

  const modal = (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="relative w-full max-w-md bg-surface border border-border/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Share2 size={18} className="text-blue-600 dark:text-amber-400" />
            <h2 className="text-base font-bold font-display text-text-primary">
              Share Intelligence Brief
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Story Title Preview */}
        <div className="p-3.5 rounded-2xl bg-surface-muted border border-border/70 text-xs font-medium text-text-secondary line-clamp-2">
          {title}
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-3 gap-3">
          {shareNetworks.map(net => (
            <a
              key={net.name}
              href={net.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`p-3.5 rounded-2xl flex flex-col items-center justify-center gap-2 transition-transform active:scale-95 shadow-xs ${net.color}`}
            >
              {net.icon}
              <span className="text-[11px] font-mono font-bold">{net.name}</span>
            </a>
          ))}
        </div>

        {/* Copy Link Input Bar */}
        <div className="space-y-1.5">
          <label className="text-[10px] font-mono uppercase text-text-tertiary">
            Direct Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={url}
              className="flex-1 px-3.5 py-2.5 rounded-xl bg-surface-muted border border-border text-xs font-mono text-text-secondary select-all focus:outline-none"
            />
            <button
              onClick={handleCopy}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
};
