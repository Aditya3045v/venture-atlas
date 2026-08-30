'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Bookmark, Share2, ArrowUpRight, Volume2, VolumeX, Check, Clock, Radio } from 'lucide-react';
import { ArticleItem } from '../../types';
import { useToast } from '../providers/ToastProvider';
import { useAccessibility } from '../providers/AccessibilityProvider';
import { formatDistanceToNow } from 'date-fns';

interface StoryCardProps {
  article: ArticleItem;
  onBookmarkToggle?: (id: string, isSaved: boolean) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({ article, onBookmarkToggle }) => {
  const { toast } = useToast();
  const { ttsSpeed } = useAccessibility();
  const [isSaved, setIsSaved] = useState(article.isSaved || false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copied, setCopied] = useState(false);

  const timeAgo = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : 'Recently';

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    onBookmarkToggle?.(article.id, nextSaved);
    toast(nextSaved ? 'Saved to library' : 'Removed from library', 'success');

    try {
      await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id, saved: nextSaved }),
      });
    } catch (err) {
      console.error('Bookmark error:', err);
    }
  };

  const handleShare = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const shareUrl = `${window.location.origin}/articles/${article.slug}`;
    const shareText = `${article.title}\n\n${article.summary}\n\nRead on Venture Atlas: ${shareUrl}`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: shareText,
          url: shareUrl,
        });
      } catch {
        // cancelled
      }
    } else {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast('Article link copied to clipboard', 'info');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTTS = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!('speechSynthesis' in window)) {
      toast('Audio synthesis is not supported on this browser', 'error');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
    } else {
      window.speechSynthesis.cancel();
      const textToRead = `${article.title}. ${article.summary}. Reported by ${article.sourceName || 'Venture Atlas'}.`;
      const utterance = new SpeechSynthesisUtterance(textToRead);
      utterance.rate = ttsSpeed || 1.05;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      setIsSpeaking(true);
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <article className="group ios-card rounded-2xl overflow-hidden flex flex-col justify-between select-none transition-all duration-300 hover:scale-[1.01] hover:border-border/80">
      <div>
        {/* Cover Photo */}
        {article.coverImage && (
          <div className="relative w-full h-48 sm:h-52 bg-surface-muted overflow-hidden">
            <img
              src={article.coverImage}
              alt={article.title}
              loading="lazy"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            />
            {/* Category Tag (translucent pill) */}
            <div className="absolute top-3 right-3">
              <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-white bg-black/75 backdrop-blur-md border border-white/10 shadow-xs">
                {article.category?.name || 'General'}
              </span>
            </div>

            {/* Audio Reading Wave Indicator */}
            {isSpeaking && (
              <div className="absolute top-3 left-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-400 text-black text-[10px] font-mono font-bold shadow-lg animate-pulse">
                <Radio size={12} className="animate-spin" />
                <span>LISTENING ({ttsSpeed}x)</span>
              </div>
            )}

            {/* Photo attribution */}
            {article.photoCredit && (
              <div className="absolute bottom-2 left-2 max-w-[80%]">
                <span className="bg-black/80 backdrop-blur-md text-white/90 px-2 py-0.5 rounded-md text-[9px] font-mono font-semibold uppercase truncate block border border-white/10">
                  {article.photoCredit}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Content Section */}
        <div className="p-5 sm:p-6 space-y-2.5">
          {/* Top metadata */}
          <div className="flex items-center justify-between text-xs font-mono text-text-tertiary">
            <span className="font-semibold text-text-secondary">
              {article.sourceName || 'Wire Report'}
            </span>
            <div className="flex items-center gap-1.5">
              <Clock size={12} />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Headline */}
          <Link href={`/articles/${article.slug}`}>
            <h2 className="text-lg md:text-xl font-black font-display text-text-primary leading-snug group-hover:opacity-90 transition-opacity line-clamp-3">
              {article.title}
            </h2>
          </Link>

          {/* 60-Word Concise Summary */}
          <p className="text-sm font-body text-text-secondary leading-relaxed line-clamp-4 font-normal pt-1">
            {article.summary}
          </p>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="px-5 sm:px-6 pb-5 pt-3 border-t border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {/* Bookmark Button */}
          <button
            onClick={handleBookmark}
            aria-label="Save story"
            title="Save to Library"
            className={`p-2 rounded-xl border transition-all active:scale-90 ${
              isSaved
                ? 'bg-amber-400/15 border-amber-400/40 text-amber-400 shadow-xs'
                : 'border-border/60 text-text-secondary hover:text-text-primary hover:bg-surface-muted'
            }`}
          >
            <Bookmark size={15} className={isSaved ? 'fill-current' : ''} />
          </button>

          {/* TTS Listen Button */}
          <button
            onClick={handleTTS}
            title={`Listen to summary (${ttsSpeed}x)`}
            className={`p-2 rounded-xl border transition-all active:scale-90 ${
              isSpeaking
                ? 'bg-amber-400 text-black border-amber-400 shadow-md font-bold'
                : 'border-border/60 text-text-secondary hover:text-text-primary hover:bg-surface-muted'
            }`}
          >
            {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            title="Share article"
            className="p-2 rounded-xl border border-border/60 text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-all active:scale-90"
          >
            {copied ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} />}
          </button>
        </div>

        {/* Read Full Article Link */}
        <Link
          href={`/articles/${article.slug}`}
          className="inline-flex items-center gap-1 text-xs font-bold font-mono uppercase text-text-primary dark:text-amber-400 hover:opacity-80 transition-opacity"
        >
          <span>Full story</span>
          <ArrowUpRight size={14} />
        </Link>
      </div>
    </article>
  );
};
