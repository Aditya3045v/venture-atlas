'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
} from 'lucide-react';
import { ArticleItem } from '@/types';
import { useToast } from '@/components/providers/ToastProvider';
import { formatDistanceToNow } from 'date-fns';
import { formatSimpleMarkdown } from '@/lib/sanitize';
import { AuthPromptModal } from '@/components/auth/AuthPromptModal';

interface StoryDetailSheetProps {
  article: ArticleItem | null;
  onClose: () => void;
}

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

  // Drop-cap initial letter calculation
  const summaryText = article.summary || article.body || '';
  const firstLetter = summaryText.charAt(0) || 'V';
  const remainingFirstParagraph = summaryText.slice(1);

  const modalContent = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-black sm:bg-black/85 sm:backdrop-blur-md animate-fadeIn overflow-hidden">
      {/* Container: 100% Fullscreen on Mobile, Centered Rounded Card on Desktop */}
      <div className="relative w-full h-full sm:h-[92vh] sm:max-w-2xl sm:mx-auto sm:my-auto bg-surface sm:rounded-[32px] overflow-hidden flex flex-col shadow-2xl border-0 sm:border border-border/80">
        
        {/* Top Floating Controls Bar */}
        <div className="absolute top-4 left-4 right-4 z-30 flex items-center justify-between pointer-events-auto">
          {/* Left: Bookmark & Share Pills */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleToggleBookmark}
              className={`p-2.5 rounded-full backdrop-blur-xl transition-all active:scale-95 shadow-xl border ${
                isSaved
                  ? 'bg-blue-600 text-white border-blue-400'
                  : 'bg-black/75 hover:bg-black text-white border-white/30'
              }`}
              title="Bookmark"
              aria-label="Save story"
            >
              <Bookmark size={17} className={isSaved ? 'fill-current' : ''} />
            </button>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/75 hover:bg-black backdrop-blur-xl text-white border border-white/30 hover:border-white/50 transition-all active:scale-95 shadow-xl"
              title="Share"
              aria-label="Share story"
            >
              {copied ? <Check size={17} className="text-emerald-400" /> : <Share2 size={17} />}
            </button>
          </div>

          {/* Right Upper Side: 100% Visible High-Contrast Back Button */}
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-black/80 hover:bg-black text-white border border-white/30 hover:border-white/60 shadow-2xl backdrop-blur-xl transition-all active:scale-95 font-mono text-xs font-bold"
            title="Back to Feed"
            aria-label="Close story"
          >
            <ArrowLeft size={16} className="text-white" />
            <span className="text-white">Back</span>
          </button>
        </div>

        {/* Scrollable Story Content Area */}
        <div className="flex-1 overflow-y-auto no-scrollbar pb-24">
          
          {/* Full-Bleed Edge-to-Edge Hero Image (No top gap, extends to top border) */}
          <div className="relative w-full h-[360px] sm:h-[400px] bg-neutral-950 overflow-hidden shrink-0">
            {article.coverImage && (
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover object-center block"
              />
            )}
            {/* Smooth Vignette Gradient from transparent top to dark bottom */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

            {/* Overlaid Category Badge & Headline */}
            <div className="absolute bottom-8 left-6 right-6 space-y-2.5 text-white z-10">
              <span className="inline-block px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-blue-600 text-white shadow-md">
                {article.category?.name || 'Technology'}
              </span>
              <h1 className="text-xl sm:text-2xl font-black font-display leading-tight text-white drop-shadow-md">
                {article.title}
              </h1>
            </div>
          </div>

          {/* Deep Curved Content Sheet */}
          <div className="relative -mt-6 rounded-t-[32px] bg-surface p-6 sm:p-8 space-y-6 z-10 border-t border-border/40 shadow-sm min-h-[400px]">
            
            {/* Author Profile Row */}
            <div className="flex items-center justify-between pb-4 border-b border-border/60">
              <div className="flex items-center gap-3">
                <img
                  src={authorAvatar}
                  alt={authorName}
                  className="w-11 h-11 rounded-full object-cover border-2 border-border shadow-xs"
                />
                <div>
                  <div className="font-bold text-sm font-display text-text-primary">
                    {authorName}
                  </div>
                  <div className="text-xs font-mono text-text-tertiary">
                    {timeAgo} · {article.viewCount ? `${article.viewCount} views` : '182 views'}
                  </div>
                </div>
              </div>

              {/* Follow Button */}
              <button
                onClick={() => {
                  setIsFollowing(!isFollowing);
                  toast(isFollowing ? `Unfollowed ${authorName}` : `Following ${authorName}`, 'info');
                }}
                className={`px-4 py-1.5 rounded-full text-xs font-mono font-bold uppercase transition-all shadow-xs flex items-center gap-1.5 active:scale-95 ${
                  isFollowing
                    ? 'bg-surface-muted text-text-primary border border-border'
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                {isFollowing ? (
                  <>
                    <UserCheck size={13} />
                    <span>Following</span>
                  </>
                ) : (
                  <>
                    <UserPlus size={13} />
                    <span>Follow</span>
                  </>
                )}
              </button>
            </div>

            {/* Main Editorial Text with Drop-Cap */}
            <div className="space-y-4 text-text-secondary leading-relaxed font-body text-sm sm:text-base">
              <p className="text-text-primary font-medium text-base sm:text-lg">
                <span className="float-left text-4xl sm:text-5xl font-black font-display text-blue-600 mr-2.5 leading-none pt-1">
                  {firstLetter}
                </span>
                {remainingFirstParagraph}
              </p>

              {/* High-Retention Quote / Analytical Callout Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-blue-500/[0.07] dark:bg-blue-500/[0.1] border-l-4 border-blue-600 text-text-primary space-y-1">
                <div className="text-xs font-mono font-bold uppercase text-blue-600 dark:text-blue-400">
                  Key Moat Breakdown
                </div>
                <p className="text-sm italic font-medium leading-relaxed">
                  "{(article as any)?.strategy || (article as any)?.challenge || 'High throughput and zero-CAC distribution unlocked sovereign margins and sustainable unit economics.'}"
                </p>
              </div>

              {/* Formatted Markdown Body */}
              {article.body && article.body !== article.summary && (
                <div
                  className="pt-2 text-sm leading-relaxed text-text-secondary space-y-2"
                  dangerouslySetInnerHTML={{
                    __html: formatSimpleMarkdown(article.body),
                  }}
                />
              )}
            </div>

          </div>
        </div>

        {/* Floating Bottom Interaction Bar (Comment & Like) */}
        <div className="absolute bottom-0 left-0 right-0 p-4 bg-surface/95 dark:bg-[#0c0d0e]/95 backdrop-blur-md border-t border-border/80 flex items-center gap-2.5 z-30">
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
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-colors shadow-md shrink-0 active:scale-90 disabled:opacity-50"
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
