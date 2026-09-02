'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Bookmark, Share2, Volume2, Heart, Clock } from 'lucide-react';
import { ArticleItem } from '../../types';
import { useToast } from '../providers/ToastProvider';
import { useAudioPlayer } from '../providers/AudioPlayerProvider';
import { formatDistanceToNow } from 'date-fns';
import { ShareModal } from '../ui/ShareModal';
import { AuthPromptModal } from '../auth/AuthPromptModal';

interface StoryCardProps {
  article: ArticleItem;
  onBookmarkToggle?: (id: string, isSaved: boolean) => void;
  onPreviewClick?: (article: ArticleItem) => void;
}

export const StoryCard: React.FC<StoryCardProps> = ({
  article,
  onBookmarkToggle,
  onPreviewClick,
}) => {
  const router = useRouter();
  const { toast } = useToast();
  const { playTrack, currentTrack, isPlaying } = useAudioPlayer();
  const [isSaved, setIsSaved] = useState(article.isSaved || false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(article.likeCount ?? 0);
  const [shareOpen, setShareOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authAction, setAuthAction] = useState<'like' | 'bookmark'>('like');

  const isCurrentAudio = currentTrack?.id === article.id && isPlaying;

  useEffect(() => {
    if (typeof window !== 'undefined' && article.id) {
      const likedList = JSON.parse(localStorage.getItem('va_liked_stories') || '[]');
      if (likedList.includes(article.id)) {
        setLiked(true);
      }
      const bookmarkedList = JSON.parse(localStorage.getItem('va_bookmarked_stories') || '[]');
      if (bookmarkedList.includes(article.id)) {
        setIsSaved(true);
      }
    }
  }, [article.id]);

  const timeAgo = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : 'Recently';

  const writerName =
    article.authorName ||
    article.author?.name ||
    article.sourceAuthor ||
    'Aditya Poddar';

  const handleCardClick = (e: React.MouseEvent) => {
    if (onPreviewClick) {
      onPreviewClick(article);
    } else {
      router.push(`/articles/${article.slug}`);
    }
  };

  const handleLike = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount(prev => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    if (typeof window !== 'undefined') {
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
      if (res.ok) {
        const data = await res.json();
        if (typeof data.likeCount === 'number') {
          setLikeCount(data.likeCount);
        }
        if (data?.requiresAuth) {
          setAuthAction('like');
          setAuthModalOpen(true);
        } else {
          toast(nextLiked ? 'Liked story ❤️' : 'Unliked', 'info');
        }
      }
    } catch {
      toast(nextLiked ? 'Liked story ❤️' : 'Unliked', 'info');
    }
  };

  const handleBookmark = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const nextSaved = !isSaved;
    setIsSaved(nextSaved);
    onBookmarkToggle?.(article.id, nextSaved);

    if (typeof window !== 'undefined') {
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
      const data = await res.json();
      if (data?.requiresAuth) {
        setAuthAction('bookmark');
        setAuthModalOpen(true);
      } else {
        toast(nextSaved ? 'Saved to library' : 'Removed from library', 'success');
      }
    } catch {
      toast(nextSaved ? 'Saved to library' : 'Removed from library', 'success');
    }
  };

  const handleAudio = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    playTrack({
      id: article.id,
      title: article.title,
      author: writerName,
      text: article.summary,
    });
    toast('Playing audio synthesis 🎧', 'info');
  };

  const handleShareClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (typeof window !== 'undefined' && navigator.share) {
      navigator.share({
        title: article.title,
        text: article.summary,
        url: `${window.location.origin}/articles/${article.slug}`,
      }).catch(() => null);
    } else {
      setShareOpen(true);
    }
  };

  return (
    <>
      <article
        onClick={handleCardClick}
        className="ios-card rounded-3xl p-5 sm:p-6 flex flex-col justify-between group transition-all duration-300 relative select-none hover:border-border cursor-pointer shadow-xs"
        role="button"
        tabIndex={0}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleCardClick(e as any);
          }
        }}
        aria-label={`Read brief: ${article.title}`}
      >
        <div className="space-y-4">
          {/* Header Metadata */}
          <div className="flex items-center justify-between text-xs font-mono">
            <span
              className="px-2.5 py-0.5 rounded-full font-bold uppercase text-[10px] tracking-wider text-white shadow-xs"
              style={{ backgroundColor: article.category?.color || '#0066FF' }}
            >
              {article.category?.name || 'General'}
            </span>

            <div className="flex items-center gap-1.5 text-text-tertiary">
              <Clock size={12} />
              <span>{timeAgo}</span>
            </div>
          </div>

          {/* Cover Photo */}
          {article.coverImage && (
            <div className="relative w-full h-44 sm:h-48 rounded-2xl overflow-hidden bg-surface-muted border border-border/60 group-hover:border-border transition-colors">
              <img
                src={article.coverImage}
                alt={article.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                loading="lazy"
              />
              {article.photoCredit && (
                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-md bg-black/65 backdrop-blur-md text-[9px] font-mono text-white/90 border border-white/10 uppercase tracking-widest pointer-events-none">
                  {article.photoCredit}
                </span>
              )}
            </div>
          )}

          {/* Title & 60-Word Brief */}
          <div className="space-y-2">
            <Link
              href={`/articles/${article.slug}`}
              onClick={e => {
                if (onPreviewClick) {
                  e.preventDefault();
                  onPreviewClick(article);
                }
              }}
            >
              <h3 className="font-bold font-display text-base sm:text-lg text-text-primary group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors leading-snug">
                {article.title}
              </h3>
            </Link>

            <p className="font-body text-xs sm:text-sm text-text-secondary line-clamp-3 leading-relaxed font-normal">
              {article.summary}
            </p>
          </div>
        </div>

        {/* Bottom Metadata & Interactivity Bar */}
        <div className="pt-4 mt-4 border-t border-border/80 flex items-center justify-between gap-2">
          {/* Reporter Byline */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 rounded-full bg-surface-muted border border-border overflow-hidden shrink-0 flex items-center justify-center text-[10px] font-mono font-bold text-text-secondary">
              {writerName.charAt(0)}
            </div>
            <span className="text-xs font-mono text-text-secondary truncate max-w-[120px]">
              {writerName}
            </span>
          </div>

          {/* Action Buttons: Like, Audio, Bookmark, Share */}
          <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
            {/* Like */}
            <button
              onClick={handleLike}
              className={`p-2 rounded-xl transition-all flex items-center gap-1 text-xs font-mono active:scale-95 ${
                liked
                  ? 'text-rose-500 bg-rose-500/10'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface-muted'
              }`}
              title="Like Brief"
              aria-label="Like story"
            >
              <Heart size={15} className={liked ? 'fill-current' : ''} />
              <span className="text-[11px] font-bold">{likeCount}</span>
            </button>

            {/* Audio Synthesis */}
            <button
              onClick={handleAudio}
              className={`p-2 rounded-xl transition-all active:scale-95 ${
                isCurrentAudio
                  ? 'text-blue-600 bg-blue-500/10 animate-pulse'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface-muted'
              }`}
              title="Listen to Brief (TTS)"
              aria-label="Listen to story audio"
            >
              <Volume2 size={15} />
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={`p-2 rounded-xl transition-all active:scale-95 ${
                isSaved
                  ? 'text-blue-600 dark:text-amber-400 bg-blue-500/10'
                  : 'text-text-tertiary hover:text-text-primary hover:bg-surface-muted'
              }`}
              title={isSaved ? 'Remove from library' : 'Save to library'}
              aria-label="Bookmark story"
            >
              <Bookmark size={15} className={isSaved ? 'fill-current' : ''} />
            </button>

            {/* Share */}
            <button
              onClick={handleShareClick}
              className="p-2 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface-muted transition-colors active:scale-95"
              title="Share Brief"
              aria-label="Share story"
            >
              <Share2 size={15} />
            </button>
          </div>
        </div>
      </article>

      {/* Share Modal */}
      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={article.title}
        url={typeof window !== 'undefined' ? `${window.location.origin}/articles/${article.slug}` : ''}
        summary={article.summary}
      />

      {/* Auth Prompt Modal for guests */}
      <AuthPromptModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        action={authAction}
      />
    </>
  );
};
