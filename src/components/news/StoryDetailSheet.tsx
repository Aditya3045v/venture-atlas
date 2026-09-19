'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import {
  Bookmark,
  Share2,
  Heart,
  Send,
  Check,
  UserCheck,
  UserPlus,
  ArrowLeft,
  Loader2,
  ExternalLink,
  Calendar,
  Building2,
  TrendingUp,
  User,
  BarChart3,
  Star,
  Lightbulb,
  AlertCircle,
  Award,
  Target,
  Rocket,
  Briefcase,
  Zap,
  Shield,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';
import { ArticleItem, CanvasCalloutBox, CanvasMetric } from '@/types';
import { useToast } from '@/components/providers/ToastProvider';
import { formatDistanceToNow } from 'date-fns';
import { formatSimpleMarkdown } from '@/lib/sanitize';
import { AuthPromptModal } from '@/components/auth/AuthPromptModal';

interface StoryDetailSheetProps {
  article: ArticleItem | null;
  onClose: () => void;
}

const renderBoxIcon = (iconName?: string) => {
  switch (iconName) {
    case 'trending':
      return <TrendingUp className="w-4 h-4 text-emerald-500" />;
    case 'star':
      return <Star className="w-4 h-4 text-blue-500 fill-blue-500/20" />;
    case 'lightbulb':
      return <Lightbulb className="w-4 h-4 text-amber-500 fill-amber-500/20" />;
    case 'alert':
      return <AlertCircle className="w-4 h-4 text-rose-500" />;
    case 'award':
      return <Award className="w-4 h-4 text-purple-500" />;
    case 'target':
      return <Target className="w-4 h-4 text-indigo-500" />;
    case 'rocket':
      return <Rocket className="w-4 h-4 text-emerald-500" />;
    case 'briefcase':
      return <Briefcase className="w-4 h-4 text-slate-500" />;
    case 'zap':
      return <Zap className="w-4 h-4 text-amber-500" />;
    case 'shield':
      return <Shield className="w-4 h-4 text-cyan-500" />;
    case 'check':
      return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
    default:
      return <Sparkles className="w-4 h-4 text-blue-500" />;
  }
};

const getBoxStyle = (box: CanvasCalloutBox) => {
  switch (box.variant) {
    case 'green':
      return 'bg-emerald-500/[0.08] border-emerald-500/30 text-emerald-950 dark:text-emerald-100';
    case 'blue':
      return 'bg-blue-500/[0.08] border-blue-500/30 text-blue-950 dark:text-blue-100';
    case 'amber':
      return 'bg-amber-500/[0.08] border-amber-500/30 text-amber-950 dark:text-amber-100';
    case 'rose':
      return 'bg-rose-500/[0.08] border-rose-500/30 text-rose-950 dark:text-rose-100';
    case 'purple':
      return 'bg-purple-500/[0.08] border-purple-500/30 text-purple-950 dark:text-purple-100';
    case 'slate':
      return 'bg-neutral-500/[0.08] border-neutral-500/30 text-neutral-950 dark:text-neutral-100';
    default:
      return 'bg-surface-muted/90 border-border text-text-primary';
  }
};

const renderMetricIcon = (iconName?: string) => {
  switch (iconName) {
    case 'calendar':
      return <Calendar className="w-3.5 h-3.5 text-rose-500" />;
    case 'unicorn':
      return <span className="text-sm leading-none">🦄</span>;
    case 'funding':
    case 'dollar':
      return <span className="font-mono font-black text-xs text-emerald-500">$</span>;
    case 'building':
      return <Building2 className="w-3.5 h-3.5 text-sky-500" />;
    case 'users':
      return <User className="w-3.5 h-3.5 text-indigo-500" />;
    case 'trending':
      return <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />;
    case 'award':
      return <Award className="w-3.5 h-3.5 text-amber-500" />;
    default:
      return <TrendingUp className="w-3.5 h-3.5 text-blue-500" />;
  }
};

export const StoryDetailSheet: React.FC<StoryDetailSheetProps> = ({ article, onClose }) => {
  const { toast } = useToast();
  const [mounted, setMounted] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [isFollowing, setIsFollowing] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [copied, setCopied] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'like' | 'bookmark' | 'comment'>('bookmark');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!article) return;
    setIsSaved(article.isSaved || false);
    setLikeCount(article.likeCount || 0);

    // Lock body scroll when modal is open
    document.body.style.overflow = 'hidden';

    // Check localStorage bookmarks / likes for client fallback sync
    if (typeof window !== 'undefined' && article.id) {
      const likedList = JSON.parse(localStorage.getItem('va_liked_stories') || '[]');
      if (likedList.includes(article.id)) {
        setIsLiked(true);
      }
      const bookmarkedList = JSON.parse(localStorage.getItem('va_bookmarked_stories') || '[]');
      if (bookmarkedList.includes(article.id)) {
        setIsSaved(true);
      }
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [article]);

  if (!mounted || !article) return null;

  const authorName =
    article.authorName ||
    article.author?.name ||
    article.sourceAuthor ||
    'Aditya Poddar';

  const authorAvatar =
    article.author?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  const timeAgo = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : 'Recently';

  const handleToggleBookmark = async () => {
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);

    if (typeof window !== 'undefined' && article.id) {
      const list = JSON.parse(localStorage.getItem('va_bookmarked_stories') || '[]');
      if (nextSaved) {
        if (!list.includes(article.id)) list.push(article.id);
      } else {
        const idx = list.indexOf(article.id);
        if (idx !== -1) list.splice(idx, 1);
      }
      localStorage.setItem('va_bookmarked_stories', JSON.stringify(list));
    }

    try {
      const res = await fetch('/api/bookmarks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ articleId: article.id, saved: nextSaved }),
      });
      if (res.status === 401) {
        setIsSaved(!nextSaved);
        setAuthAction('bookmark');
        setAuthModalOpen(true);
        return;
      }
      const data = await res.json();
      if (!res.ok) {
        toast(data.error || 'Failed to save bookmark', 'error');
      } else {
        toast(nextSaved ? 'Saved to device library' : 'Removed from library', 'info');
      }
    } catch {
      toast(nextSaved ? 'Saved locally on this device' : 'Removed from library', 'info');
    }
  };

  const handleToggleLike = async () => {
    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikeCount(prev => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    if (typeof window !== 'undefined' && article.id) {
      const likedList = JSON.parse(localStorage.getItem('va_liked_stories') || '[]');
      if (nextLiked) {
        if (!likedList.includes(article.id)) likedList.push(article.id);
      } else {
        const idx = likedList.indexOf(article.id);
        if (idx !== -1) likedList.splice(idx, 1);
      }
      localStorage.setItem('va_liked_stories', JSON.stringify(likedList));
    }

    try {
      const res = await fetch(`/api/articles/${article.id}/like`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ liked: nextLiked }),
      });
      if (res.status === 401) {
        setIsLiked(!nextLiked);
        setLikeCount(prev => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
        setAuthAction('like');
        setAuthModalOpen(true);
        return;
      }
      if (res.ok) {
        const data = await res.json();
        if (typeof data.likeCount === 'number') {
          setLikeCount(data.likeCount);
        }
        toast(nextLiked ? 'Liked story ❤️' : 'Unliked', 'info');
      }
    } catch {
      toast(nextLiked ? 'Liked on this device' : 'Unliked', 'info');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      const url = `${window.location.origin}/articles/${article.slug}`;
      if (navigator.share) {
        navigator
          .share({
            title: article.title,
            text: article.summary,
            url,
          })
          .catch(() => null);
      } else {
        navigator.clipboard.writeText(url);
        setCopied(true);
        toast('Link copied to clipboard', 'info');
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    const comment = commentText.trim();
    if (!comment) return;

    setSubmittingComment(true);
    try {
      const res = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entityId: article.id,
          comment,
        }),
      });
      if (res.status === 401) {
        setAuthAction('comment');
        setAuthModalOpen(true);
        return;
      }
      const data = await res.json();

      if (res.ok && data.success) {
        toast('Submitted for editorial review ✍️', 'success');
        setCommentText('');
      } else {
        toast(data.error || 'Failed to submit comment', 'error');
      }
    } catch {
      toast('Failed to submit comment. Please check connection.', 'error');
    } finally {
      setSubmittingComment(false);
    }
  };

  // Content extraction
  const summaryText = article.summary?.trim() || '';
  const bodyText = article.body?.trim() || '';
  const hasDistinctBody = Boolean(bodyText && summaryText && bodyText !== summaryText);
  const canvasData = article.canvasData;
  const metrics = canvasData?.metrics || [];
  const profile = canvasData?.profile;
  const calloutBoxes = canvasData?.calloutBoxes || [];
  const sourceName = article.sourceName || '';
  const sourceUrl = article.sourceUrl || '';
  const sourceAuthor = article.sourceAuthor || '';

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black sm:bg-black/85 sm:backdrop-blur-md animate-fadeIn overflow-hidden">
      {/* Click outside backdrop on desktop */}
      <div className="fixed inset-0 hidden sm:block" onClick={onClose} />

      {/* Container: 100% Fullscreen on Mobile, Centered Rounded Card on Desktop */}
      <div className="relative z-10 w-full h-full sm:h-[92vh] sm:max-w-3xl sm:mx-auto sm:my-auto bg-surface sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl border-0 sm:border border-border/80">
        
        {/* Top Floating Controls Bar */}
        <div className="sticky top-0 left-0 right-0 z-30 px-4 py-3 bg-surface/95 dark:bg-[#0c0d0e]/95 backdrop-blur-md border-b border-border/70 flex items-center justify-between">
          {/* Left: Bookmark, Share & Full Page Link */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className={`p-2 rounded-xl transition-all active:scale-95 border ${
                isSaved
                  ? 'bg-blue-600 text-white border-blue-500'
                  : 'bg-surface-muted hover:bg-surface text-text-secondary hover:text-text-primary border-border'
              }`}
              title="Bookmark"
              aria-label="Save story"
            >
              <Bookmark size={15} className={isSaved ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleShare}
              className="p-2 rounded-xl bg-surface-muted hover:bg-surface text-text-secondary hover:text-text-primary border border-border transition-all active:scale-95"
              title="Share"
              aria-label="Share story"
            >
              {copied ? <Check size={15} className="text-emerald-400" /> : <Share2 size={15} />}
            </button>
            <Link
              href={`/articles/${article.slug}`}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-muted hover:bg-surface text-text-secondary hover:text-blue-600 dark:hover:text-amber-400 border border-border font-mono text-xs font-bold transition-colors"
              title="Open full standalone article page"
            >
              <span>Full Page</span>
              <ExternalLink size={12} />
            </Link>
          </div>

          {/* Right: Back Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-surface-muted hover:bg-border text-text-primary border border-border transition-all active:scale-95 font-mono text-xs font-bold cursor-pointer"
            title="Back to Feed"
            aria-label="Close story"
          >
            <ArrowLeft size={14} />
            <span>Close</span>
          </button>
        </div>

        {/* Scrollable Story Content Area with comfortable reading flow */}
        <div className="flex-1 overflow-y-auto pb-32">
          
          {/* Compact Hero Banner Section */}
          {article.coverImage && (
            <div className="relative w-full h-32 sm:h-40 bg-neutral-950 overflow-hidden shrink-0">
              <img
                src={article.coverImage.trim()}
                alt={article.title}
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover object-center block"
                onError={e => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent pointer-events-none" />
              {article.photoCredit && (
                <span className="absolute bottom-2 right-3 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-md text-[9px] font-mono text-white/80 border border-white/10 uppercase tracking-widest">
                  {article.photoCredit}
                </span>
              )}
            </div>
          )}

          {/* Editorial Content Sheet */}
          <div className="p-4 sm:p-6 space-y-5">
            
            {/* Category Badge, Title & Attribution */}
            <div className="space-y-3">
              <div className="flex items-center gap-2 flex-wrap text-xs font-mono">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-white shadow-xs"
                  style={{ backgroundColor: article.category?.color || '#0066FF' }}
                >
                  {article.category?.name || 'Intelligence'}
                </span>
                <span className="text-text-tertiary">·</span>
                <span className="text-text-tertiary">
                  {article.readTimeMinutes || 1} min read
                </span>
                <span className="text-text-tertiary">·</span>
                <span className="text-text-tertiary">{timeAgo}</span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-black font-display leading-tight text-text-primary">
                {article.title}
              </h1>

              {/* Author / Reporter Row */}
              <div className="flex items-center justify-between pt-2 pb-3 border-b border-border/70">
                <div className="flex items-center gap-3">
                  <img
                    src={authorAvatar}
                    alt={authorName}
                    className="w-9 h-9 rounded-full object-cover border border-border shadow-xs"
                  />
                  <div>
                    <div className="font-bold text-xs sm:text-sm font-display text-text-primary">
                      {authorName}
                    </div>
                    <div className="text-[11px] font-mono text-text-tertiary">
                      {article.authorRole || 'Senior Venture Reporter'}
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setIsFollowing(!isFollowing);
                    toast(isFollowing ? `Unfollowed ${authorName}` : `Following ${authorName}`, 'info');
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase transition-all shadow-xs flex items-center gap-1 active:scale-95 ${
                    isFollowing
                      ? 'bg-surface-muted text-text-primary border border-border'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={12} />
                      <span>Following</span>
                    </>
                  ) : (
                    <>
                      <UserPlus size={12} />
                      <span>Follow</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* 1. Complete Published Text Content */}
            <div className="space-y-5">
              {/* Primary Briefing / Summary Section */}
              {summaryText && (
                <div className="p-4 sm:p-5 rounded-2xl bg-surface-muted/90 border border-border space-y-2">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                    EXECUTIVE WIRE BRIEF
                  </div>
                  <div
                    className="text-text-primary font-medium text-sm sm:text-base leading-relaxed whitespace-pre-line"
                    dangerouslySetInnerHTML={{
                      __html: formatSimpleMarkdown(summaryText),
                    }}
                  />
                </div>
              )}

              {/* Full Detailed Body Report (when distinct or additional) */}
              {hasDistinctBody && (
                <div className="space-y-3 pt-2">
                  <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-tertiary">
                    FULL EDITORIAL REPORT & WIRE DETAILS
                  </h4>
                  <div
                    className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-text-secondary space-y-4"
                    dangerouslySetInnerHTML={{
                      __html: formatSimpleMarkdown(bodyText),
                    }}
                  />
                </div>
              )}

              {/* If only body was provided (no summary), show body directly */}
              {!summaryText && bodyText && (
                <div
                  className="prose dark:prose-invert max-w-none text-sm sm:text-base leading-relaxed text-text-secondary space-y-4"
                  dangerouslySetInnerHTML={{
                    __html: formatSimpleMarkdown(bodyText),
                  }}
                />
              )}
            </div>

            {/* 2. Key Metrics Grid (if Canvas metrics are configured) */}
            {metrics.length > 0 && (
              <div className="space-y-2 pt-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-tertiary">
                  DEAL & COMPANY SIGNALS
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {metrics.map(metric => (
                    <div
                      key={metric.id}
                      className="p-3 rounded-2xl border border-border bg-surface-muted/60 flex items-start gap-2"
                    >
                      <div className="shrink-0 pt-0.5">
                        {renderMetricIcon(metric.icon)}
                      </div>
                      <div className="space-y-0.5 min-w-0">
                        <div className="text-[9px] font-mono font-bold uppercase tracking-wider text-text-tertiary truncate">
                          {metric.label}
                        </div>
                        <div className="text-xs sm:text-sm font-black font-display text-text-primary leading-tight truncate">
                          {metric.value}
                        </div>
                        {metric.subValue && (
                          <div className="text-[9px] font-mono text-text-tertiary truncate">
                            {metric.subValue}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Core Strategy & Business Model Points (from profile) */}
            {profile?.businessModelPoints && profile.businessModelPoints.length > 0 && (
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/[0.06] dark:bg-amber-500/[0.08] border border-amber-500/20 space-y-2.5">
                <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase text-amber-600 dark:text-amber-400">
                  <BarChart3 size={15} />
                  <span>{profile.businessModelTitle || 'Core Strategy & Architecture Takeaways'}</span>
                </div>
                <ul className="space-y-1.5 text-xs sm:text-sm font-body text-text-secondary leading-relaxed">
                  {profile.businessModelPoints.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold shrink-0">•</span>
                      <span>{pt.replace(/^[•\s*-]+/, '')}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* 4. Canvas Modular Callout Boxes (Milestones, Playbooks, Lessons, Takeaways) */}
            {calloutBoxes.length > 0 && (
              <div className="space-y-3 pt-2">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-text-tertiary">
                  IN-DEPTH OPERATOR PLAYBOOK & LESSONS
                </div>
                {calloutBoxes.map(box => {
                  const styleClass = getBoxStyle(box);
                  return (
                    <div
                      key={box.id}
                      className={`p-4 sm:p-5 rounded-2xl border transition-all space-y-2 ${styleClass}`}
                    >
                      <div className="flex items-center gap-2">
                        <div className="shrink-0">{renderBoxIcon(box.icon)}</div>
                        <h3 className="text-xs sm:text-sm font-black font-display uppercase tracking-wide">
                          {box.title || 'Key Analysis'}
                        </h3>
                      </div>

                      <div className="text-xs sm:text-sm font-body leading-relaxed whitespace-pre-line font-normal opacity-95">
                        {box.content}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 5. Editorial Sourcing & Attribution */}
            {(sourceName || sourceAuthor || sourceUrl) && (
              <div className="p-4 rounded-2xl bg-surface-muted/70 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs font-mono">
                <div className="space-y-0.5">
                  <div className="text-[9px] font-bold uppercase text-text-tertiary tracking-wider">
                    PRIMARY EDITORIAL ATTRIBUTION
                  </div>
                  <div className="text-text-primary flex flex-wrap items-center gap-1.5">
                    {sourceAuthor && <span>Reported by <strong>{sourceAuthor}</strong></span>}
                    {sourceName && (
                      <>
                        <span className="text-text-tertiary">•</span>
                        <span>Source: <strong>{sourceName}</strong></span>
                      </>
                    )}
                  </div>
                </div>

                {sourceUrl && (
                  <a
                    href={sourceUrl}
                    target="_blank"
                    rel="noopener noreferrer nofollow"
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline shrink-0"
                  >
                    <span>Verify Primary Filing</span>
                    <ExternalLink size={12} />
                  </a>
                )}
              </div>
            )}

          </div>
        </div>

        {/* Floating Bottom Interaction Bar (Comment & Like) */}
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-surface/95 dark:bg-[#0c0d0e]/95 backdrop-blur-md border-t border-border/80 flex items-center gap-2.5 z-30">
          <button
            onClick={handleToggleLike}
            className={`px-3.5 py-2.5 rounded-full border transition-all text-xs font-mono font-bold flex items-center gap-1.5 active:scale-95 shrink-0 ${
              isLiked
                ? 'bg-rose-500/15 border-rose-500 text-rose-500 shadow-xs'
                : 'bg-surface-muted border-border text-text-secondary hover:text-text-primary'
            }`}
          >
            <Heart size={16} className={isLiked ? 'fill-current' : ''} />
            <span>{likeCount}</span>
          </button>

          <form onSubmit={handleSendComment} className="flex-1 flex items-center gap-2">
            <input
              type="text"
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder="Write a perspective on this deal..."
              disabled={submittingComment}
              className="w-full px-4 py-2.5 rounded-full bg-surface-muted border border-border text-xs font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-blue-500 disabled:opacity-60"
            />
            <button
              type="submit"
              disabled={submittingComment || !commentText.trim()}
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors shadow-md shrink-0 active:scale-90 disabled:opacity-50 cursor-pointer"
            >
              {submittingComment ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Send size={15} className="translate-x-0.5" />
              )}
            </button>
          </form>
        </div>

      </div>

      {/* Sign-in prompt for guest users */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        action={authAction}
      />
    </div>
  );

  return createPortal(modalContent, document.body);
};

