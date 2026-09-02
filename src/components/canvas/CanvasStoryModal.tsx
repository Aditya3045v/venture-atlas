'use client';

import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { ArticleItem, CaseStudyItem } from '@/types';
import { CanvasStoryView } from './CanvasStoryView';
import Link from 'next/link';

interface CanvasStoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  story: ArticleItem | CaseStudyItem | null;
}

export const CanvasStoryModal: React.FC<CanvasStoryModalProps> = ({
  isOpen,
  onClose,
  story,
}) => {
  if (!isOpen || !story) return null;

  const fullPageUrl = (story as any)?.company
    ? `/case-studies/${story.slug}`
    : `/articles/${story.slug}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      {/* Click outside backdrop */}
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-3xl my-auto bg-transparent max-h-[92vh] flex flex-col rounded-3xl overflow-hidden shadow-2xl">
        {/* Modal Top Floating Bar */}
        <div className="flex items-center justify-between px-4 py-2 bg-neutral-900/90 text-white backdrop-blur-md rounded-t-3xl border-t border-x border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-amber-400">
              {(story as any)?.company ? 'STARTUP PLAYBOOK' : 'EXECUTIVE WIRE BRIEF'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href={fullPageUrl}
              target="_blank"
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
              title="Open full page in new tab"
            >
              <ExternalLink size={16} />
            </Link>
            <button
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-white/10 text-neutral-300 hover:text-white transition-colors"
              title="Close modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Story View */}
        <div className="overflow-y-auto max-h-[calc(92vh-48px)] no-scrollbar rounded-b-3xl">
          <CanvasStoryView story={story} isModal={true} />
        </div>
      </div>
    </div>
  );
};
