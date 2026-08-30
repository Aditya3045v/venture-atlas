import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Compass } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="max-w-md mx-auto py-16 text-center space-y-6 select-none">
      <div className="w-16 h-16 rounded-3xl bg-surface border border-border/80 text-text-primary flex items-center justify-center mx-auto shadow-card">
        <Compass size={28} className="text-text-primary" />
      </div>

      <div className="space-y-2">
        <div className="text-xs font-mono font-bold uppercase tracking-wider text-text-tertiary">
          404 · STREAM NOT FOUND
        </div>
        <h1 className="text-3xl font-black font-display uppercase tracking-tight text-text-primary">
          Page Does Not Exist
        </h1>
        <p className="text-sm font-body text-text-secondary leading-relaxed">
          The requested news brief, category desk, or editorial essay has moved or does not exist on the wire.
        </p>
      </div>

      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-text-primary text-background text-xs font-mono font-bold uppercase tracking-wider hover:opacity-90 transition-opacity shadow-xs"
        >
          <ArrowLeft size={14} />
          <span>Return to Live Wire</span>
        </Link>
      </div>
    </div>
  );
}
