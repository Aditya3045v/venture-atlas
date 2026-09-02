'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ArticleItem, CategoryItem } from '@/types';
import { StoryCard } from './StoryCard';
import { StoryDetailSheet } from './StoryDetailSheet';
import { RefreshCw, WifiOff, CheckCircle2, ChevronDown } from 'lucide-react';

interface FeedStreamProps {
  initialArticles: ArticleItem[];
  categories: CategoryItem[];
  activeCategory?: string;
}

export const FeedStream: React.FC<FeedStreamProps> = ({
  initialArticles,
  categories,
  activeCategory = 'all',
}) => {
  const [articles, setArticles] = useState<ArticleItem[]>(initialArticles);
  const [category, setCategory] = useState(activeCategory);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<{ publishedAt: string; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isOffline, setIsOffline] = useState(false);
  const [selectedStory, setSelectedStory] = useState<ArticleItem | null>(null);
  const observerRef = useRef<HTMLDivElement | null>(null);

  // Monitor offline/online status
  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);

    if (typeof window !== 'undefined') {
      setIsOffline(!navigator.onLine);
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
    }
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Update articles when activeCategory changes
  useEffect(() => {
    setCategory(activeCategory);
    setArticles(
      activeCategory === 'all'
        ? initialArticles
        : initialArticles.filter(a => a.category?.slug === activeCategory)
    );
    setNextCursor(null);
    setHasMore(true);
    setError(null);
  }, [activeCategory, initialArticles]);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore || isOffline) return;
    setLoading(true);
    setError(null);

    try {
      const lastArticle = articles[articles.length - 1];
      const cursorPubAt = nextCursor?.publishedAt || (lastArticle?.publishedAt ? new Date(lastArticle.publishedAt).toISOString() : '');
      const cursorId = nextCursor?.id || lastArticle?.id || '';

      const params = new URLSearchParams({
        limit: '6',
        category: category !== 'all' ? category : '',
        ...(cursorPubAt ? { cursor_published_at: cursorPubAt } : {}),
        ...(cursorId ? { cursor_id: cursorId } : {}),
      });

      const res = await fetch(`/api/articles?${params.toString()}`);
      if (!res.ok) throw new Error('Failed to load more stories');

      const data = await res.json();
      const newArticles: ArticleItem[] = data.articles || [];

      if (newArticles.length === 0) {
        setHasMore(false);
      } else {
        // De-duplicate by ID
        setArticles(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const filtered = newArticles.filter(a => !existingIds.has(a.id));
          return [...prev, ...filtered];
        });
        setNextCursor(data.nextCursor || null);
        setHasMore(data.hasMore ?? false);
      }
    } catch (err: any) {
      setError(err?.message || 'Error loading more feeds');
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, isOffline, articles, nextCursor, category]);

  // Infinite Scroll IntersectionObserver
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '200px' }
    );

    const currentTarget = observerRef.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [loadMore, hasMore, loading]);

  return (
    <div className="space-y-6">
      {/* Offline Status Alert */}
      {isOffline && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 flex items-center justify-between gap-3 text-xs font-mono">
          <div className="flex items-center gap-2">
            <WifiOff size={16} />
            <span>You are currently offline. Showing cached intelligence briefs.</span>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="px-3 py-1 rounded-lg bg-amber-500 text-black font-bold hover:bg-amber-400 transition-colors"
          >
            Retry
          </button>
        </div>
      )}

      {/* Grid of Articles */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <StoryCard
            key={article.id}
            article={article}
            onPreviewClick={setSelectedStory}
          />
        ))}

        {/* Skeleton Loaders matching exact layout */}
        {loading && (
          <>
            {[1, 2, 3].map(i => (
              <div
                key={`skeleton-${i}`}
                className="ios-card rounded-3xl p-5 sm:p-6 space-y-4 animate-pulse bg-surface border border-border"
              >
                <div className="flex items-center justify-between">
                  <div className="h-4 w-20 bg-surface-muted rounded-full" />
                  <div className="h-4 w-12 bg-surface-muted rounded-full" />
                </div>
                <div className="h-48 w-full bg-surface-muted rounded-2xl" />
                <div className="space-y-2">
                  <div className="h-5 w-3/4 bg-surface-muted rounded" />
                  <div className="h-4 w-full bg-surface-muted rounded" />
                  <div className="h-4 w-5/6 bg-surface-muted rounded" />
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="h-3 w-24 bg-surface-muted rounded" />
                  <div className="h-7 w-16 bg-surface-muted rounded-full" />
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* Error state with retry */}
      {error && !loading && (
        <div className="p-6 rounded-2xl bg-surface border border-rose-500/30 text-center space-y-3">
          <p className="text-xs font-mono text-rose-500">{error}</p>
          <button
            onClick={loadMore}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-surface-muted hover:bg-surface border border-border text-xs font-mono font-bold transition-all"
          >
            <RefreshCw size={13} />
            <span>Retry Loading</span>
          </button>
        </div>
      )}

      {/* Manual Load More Button fallback & Observer Anchor */}
      <div ref={observerRef} className="pt-4 flex flex-col items-center justify-center space-y-3">
        {hasMore && !loading && !error && (
          <button
            onClick={loadMore}
            className="px-6 py-2.5 rounded-full border border-border hover:border-blue-500/50 bg-surface hover:bg-surface-muted text-xs font-mono font-bold text-text-secondary hover:text-text-primary transition-all flex items-center gap-2 shadow-xs active:scale-95"
          >
            <span>Load More Briefs</span>
            <ChevronDown size={14} />
          </button>
        )}

        {/* End of Stream State */}
        {!hasMore && articles.length > 0 && (
          <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary py-6">
            <CheckCircle2 size={16} className="text-emerald-500" />
            <span>You have caught up with all live intelligence briefs</span>
          </div>
        )}
      </div>

      {/* Story Detail Sheet Modal on click */}
      <StoryDetailSheet
        article={selectedStory}
        onClose={() => setSelectedStory(null)}
      />
    </div>
  );
};
