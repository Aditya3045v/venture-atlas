'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Clock, Pause, Play, ChevronLeft, ChevronRight } from 'lucide-react';
import { IconBolt } from '@tabler/icons-react';
import { ArticleItem } from '../../types';
import { formatDistanceToNow } from 'date-fns';

interface FeaturedStoryProps {
  article?: ArticleItem;
  articles?: ArticleItem[];
  autoPlayInterval?: number; // default 3000ms (3 seconds)
}

const FALLBACK_IMAGES: Record<string, string> = {
  unicorn: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?auto=format&fit=crop&w=1200&q=80',
  failure: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80',
  finance: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1200&q=80',
  'crypto-web3': 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1200&q=80',
  'founder-biography': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=1200&q=80',
  'case-studies': 'https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?auto=format&fit=crop&w=1200&q=80',
};

const DEFAULT_FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1200&q=80';

export const FeaturedStory: React.FC<FeaturedStoryProps> = ({
  article,
  articles,
  autoPlayInterval = 3000,
}) => {
  // Build the list of carousel articles
  const storyList = articles && articles.length > 0 ? articles : article ? [article] : [];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [progress, setProgress] = useState(0);

  const hasMultiple = storyList.length > 1;

  // Safe bounds check in case storyList changes dynamically
  const safeIndex = currentIndex < storyList.length ? currentIndex : 0;
  const currentArticle = storyList[safeIndex];

  // Navigation handlers
  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    setCurrentIndex(prev => (prev - 1 + storyList.length) % storyList.length);
    setProgress(0);
  }, [hasMultiple, storyList.length]);

  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    setCurrentIndex(prev => (prev + 1) % storyList.length);
    setProgress(0);
  }, [hasMultiple, storyList.length]);

  const handleGoTo = useCallback((index: number) => {
    setCurrentIndex(index);
    setProgress(0);
  }, []);

  const togglePause = useCallback(() => {
    setIsPaused(prev => !prev);
  }, []);

  // 3-second running news auto-advance loop with 50ms smooth tick
  useEffect(() => {
    if (!hasMultiple || isPaused || isHovered) return;

    const TICK_MS = 50;
    const increment = (TICK_MS / autoPlayInterval) * 100;

    const timer = setInterval(() => {
      setProgress(prev => {
        const next = prev + increment;
        if (next >= 100) {
          setCurrentIndex(curr => (curr + 1) % storyList.length);
          return 0;
        }
        return next;
      });
    }, TICK_MS);

    return () => clearInterval(timer);
  }, [hasMultiple, isPaused, isHovered, autoPlayInterval, storyList.length]);

  // Keyboard navigation when user is focused on the carousel
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      handlePrev();
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      handleNext();
    } else if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
      e.preventDefault();
      togglePause();
    }
  };

  if (!currentArticle) return null;

  const timeAgo = currentArticle.publishedAt
    ? formatDistanceToNow(new Date(currentArticle.publishedAt), { addSuffix: true })
    : 'Recently';

  const categorySlug = currentArticle.category?.slug || '';
  const fallbackUrl = FALLBACK_IMAGES[categorySlug] || DEFAULT_FALLBACK_IMAGE;
  const displayImage = currentArticle.coverImage?.trim() || fallbackUrl;

  return (
    <div
      role="region"
      aria-label="Running news hero carousel"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="relative w-full rounded-3xl ios-card overflow-hidden group mb-8 select-none border border-border/80 bg-surface focus:outline-none focus:ring-2 focus:ring-amber-400/40 lg:h-[440px]"
    >
      {/* 3-second cycle progress indicator line */}
      {hasMultiple && (
        <div className="absolute top-0 left-0 right-0 h-[3px] bg-border/40 z-30 overflow-hidden">
          <div
            className={`h-full transition-all duration-75 ease-linear ${
              isPaused ? 'bg-amber-400' : 'bg-emerald-500 dark:bg-emerald-400'
            }`}
            style={{
              width: `${Math.min(100, Math.max(0, progress))}%`,
            }}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 lg:h-full">
        {/* Cover Photo (7 cols on lg) */}
        <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full bg-surface-muted overflow-hidden">
          <img
            key={`img-${currentArticle.id}`}
            src={displayImage}
            alt={currentArticle.title}
            referrerPolicy="no-referrer"
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.02] transition-all duration-500 ease-out animate-in fade-in"
            onError={e => {
              const target = e.target as HTMLImageElement;
              if (target.src !== fallbackUrl) {
                target.src = fallbackUrl;
              }
            }}
          />

          {/* Badges on Top-Left of Image */}
          <div className="absolute top-4 left-4 flex items-center gap-2 z-20">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-xs flex items-center gap-1.5">
              <IconBolt size={12} className="text-amber-400" />
              <span>LEAD STORY</span>
            </span>
            {currentArticle.category?.name && (
              <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white/90 border border-white/10 shadow-xs">
                {currentArticle.category.name}
              </span>
            )}
          </div>

          {/* Floating Navigation Arrows on Image (visible on hover) */}
          {hasMultiple && (
            <div className="absolute inset-y-0 inset-x-3 flex items-center justify-between pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="pointer-events-auto p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 shadow-lg transition-transform active:scale-90"
                aria-label="Previous story"
                title="Previous story"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="pointer-events-auto p-2 rounded-full bg-black/70 hover:bg-black/90 text-white backdrop-blur-md border border-white/10 shadow-lg transition-transform active:scale-90"
                aria-label="Next story"
                title="Next story"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          {/* Photo Credit if provided */}
          {currentArticle.photoCredit && (
            <div className="absolute bottom-3 left-4 z-20">
              <span className="px-2 py-0.5 rounded-md bg-black/60 backdrop-blur-md text-[9px] font-mono text-white/80 border border-white/10 uppercase tracking-wider">
                {currentArticle.photoCredit}
              </span>
            </div>
          )}
        </div>

        {/* Story Text & Controls (5 cols on lg) */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between h-full overflow-hidden">
          <div className="space-y-3">
            {/* Top Row: Source, Time, and Carousel Pause/Navigation Controls */}
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border/40 pb-3 shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
                <span className="font-bold text-text-secondary uppercase">
                  {currentArticle.sourceName || 'Wire Report'}
                </span>
                <span>·</span>
                <div className="flex items-center gap-1">
                  <Clock size={12} />
                  <span>{timeAgo}</span>
                </div>
              </div>

              {/* Carousel Controls Strip */}
              {hasMultiple && (
                <div className="flex items-center gap-1.5 bg-surface-muted/90 px-2.5 py-1 rounded-full border border-border/80 shadow-xs">
                  {/* Live Status Badge */}
                  <span className="flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider uppercase text-text-secondary pr-1">
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isPaused
                          ? 'bg-amber-500'
                          : isHovered
                          ? 'bg-blue-400'
                          : 'bg-emerald-500 animate-pulse'
                      }`}
                    />
                    <span>{isPaused ? 'Paused' : isHovered ? 'Reading' : '3s'}</span>
                  </span>

                  <span className="text-border text-xs">|</span>

                  {/* Slide Counter: 01 / 05 */}
                  <span className="text-[10px] font-mono font-bold text-text-primary px-1">
                    {String(safeIndex + 1).padStart(2, '0')}/{String(storyList.length).padStart(2, '0')}
                  </span>

                  <span className="text-border text-xs">|</span>

                  {/* Previous Button */}
                  <button
                    type="button"
                    onClick={handlePrev}
                    className="p-1 rounded hover:bg-surface text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                    aria-label="Previous story"
                    title="Previous story"
                  >
                    <ChevronLeft size={13} />
                  </button>

                  {/* Pause / Resume Button */}
                  <button
                    type="button"
                    onClick={togglePause}
                    className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold flex items-center gap-1 transition-all active:scale-95 ${
                      isPaused
                        ? 'bg-emerald-500 text-white hover:bg-emerald-600 shadow-xs'
                        : 'bg-amber-400 text-neutral-950 hover:bg-amber-300 shadow-xs'
                    }`}
                    aria-label={isPaused ? 'Resume auto-running news' : 'Pause auto-running news'}
                    title={isPaused ? 'Click to resume 3s cycle' : 'Click to pause here'}
                  >
                    {isPaused ? (
                      <>
                        <Play size={10} className="fill-current" />
                        <span>PLAY</span>
                      </>
                    ) : (
                      <>
                        <Pause size={10} className="fill-current" />
                        <span>PAUSE</span>
                      </>
                    )}
                  </button>

                  {/* Next Button */}
                  <button
                    type="button"
                    onClick={handleNext}
                    className="p-1 rounded hover:bg-surface text-text-secondary hover:text-text-primary transition-colors focus:outline-none"
                    aria-label="Next story"
                    title="Next story"
                  >
                    <ChevronRight size={13} />
                  </button>
                </div>
              )}
            </div>

            {/* Article Headline with smooth transition */}
            <div key={`content-${currentArticle.id}`} className="space-y-3 animate-in fade-in duration-300">
              <Link href={`/articles/${currentArticle.slug}`} className="block group/title">
                <h2 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-text-primary leading-tight tracking-tight group-hover/title:text-brand transition-colors line-clamp-3">
                  {currentArticle.title}
                </h2>
              </Link>

              <p className="text-sm md:text-base font-body text-text-secondary leading-relaxed font-normal line-clamp-3 sm:line-clamp-4">
                {currentArticle.summary}
              </p>
            </div>
          </div>

          {/* Bottom Bar: Stats, Slide Dots, and Read Analysis CTA */}
          <div className="pt-4 border-t border-border/50 flex flex-wrap items-center justify-between gap-3 mt-auto shrink-0">
            <div className="flex items-center gap-3">
              <div className="text-xs font-mono text-text-tertiary">
                {currentArticle.readTimeMinutes} min read · {currentArticle.wordCount} words
              </div>

              {/* Clickable Slide Indicators / Dots */}
              {hasMultiple && (
                <div className="flex items-center gap-1.5 pl-2 border-l border-border/50" aria-label="Story carousel navigation">
                  {storyList.map((st, idx) => (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => handleGoTo(idx)}
                      className={`h-1.5 rounded-full transition-all duration-300 focus:outline-none ${
                        idx === safeIndex
                          ? 'w-6 bg-brand'
                          : 'w-1.5 bg-border hover:bg-text-tertiary'
                      }`}
                      aria-label={`Jump to story ${idx + 1}: ${st.title}`}
                      title={st.title}
                    />
                  ))}
                </div>
              )}
            </div>

            <Link
              href={`/articles/${currentArticle.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-text-primary text-background text-xs font-bold font-mono uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 shadow-xs"
            >
              <span>Read analysis</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
