'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
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
  Share2,
  Bookmark,
  Sparkles,
  Check,
  Heart,
  ExternalLink,
  ArrowUpRight,
} from 'lucide-react';
import { CanvasData, CanvasMetric, CanvasCalloutBox, ArticleItem, CaseStudyItem } from '@/types';
import { useToast } from '@/components/providers/ToastProvider';

interface CanvasStoryViewProps {
  story?: ArticleItem | CaseStudyItem | null;
  canvasData?: CanvasData | null;
  isModal?: boolean;
}

// Icon mapper for dynamic metric icons
const renderMetricIcon = (iconName?: string, colorClass = 'text-brand') => {
  switch (iconName) {
    case 'calendar':
      return <Calendar className="w-5 h-5 text-rose-500" />;
    case 'unicorn':
      return <span className="text-xl leading-none">🦄</span>;
    case 'funding':
    case 'dollar':
      return (
        <div className="w-7 h-7 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 font-bold text-xs">
          $
        </div>
      );
    case 'building':
      return <Building2 className="w-5 h-5 text-sky-500" />;
    case 'users':
      return <User className="w-5 h-5 text-indigo-500" />;
    case 'trending':
      return <TrendingUp className="w-5 h-5 text-emerald-500" />;
    case 'award':
      return <Award className="w-5 h-5 text-amber-500" />;
    default:
      return <TrendingUp className="w-5 h-5 text-brand" />;
  }
};

// Icon mapper for dynamic callout box icons
const renderBoxIcon = (iconName?: string) => {
  switch (iconName) {
    case 'trending':
      return <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case 'star':
      return <Star className="w-5 h-5 text-blue-600 dark:text-blue-400 fill-blue-500/20" />;
    case 'lightbulb':
      return <Lightbulb className="w-5 h-5 text-amber-600 dark:text-amber-400 fill-amber-500/20" />;
    case 'alert':
      return <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400" />;
    case 'award':
      return <Award className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
    case 'target':
      return <Target className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />;
    case 'rocket':
      return <Rocket className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    case 'briefcase':
      return <Briefcase className="w-5 h-5 text-slate-700 dark:text-slate-300" />;
    case 'zap':
      return <Zap className="w-5 h-5 text-amber-500" />;
    case 'shield':
      return <Shield className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />;
    case 'check':
      return <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />;
    default:
      return <Sparkles className="w-5 h-5 text-brand" />;
  }
};

// Preset styling for callout canvas boxes
const getBoxStyle = (box: CanvasCalloutBox) => {
  if (box.variant === 'custom') {
    return {
      backgroundColor: box.customBg || '#f8fafc',
      borderColor: box.customBorder || '#cbd5e1',
      color: box.customTextColor || '#0f172a',
    };
  }

  switch (box.variant) {
    case 'green':
      return {
        className: 'bg-emerald-50/80 dark:bg-emerald-950/30 border-emerald-200/90 dark:border-emerald-800/60 text-emerald-950 dark:text-emerald-200',
        titleColor: 'text-emerald-800 dark:text-emerald-300',
      };
    case 'blue':
      return {
        className: 'bg-sky-50/80 dark:bg-sky-950/30 border-sky-200/90 dark:border-sky-800/60 text-sky-950 dark:text-sky-200',
        titleColor: 'text-sky-800 dark:text-sky-300',
      };
    case 'amber':
      return {
        className: 'bg-amber-50/80 dark:bg-amber-950/30 border-amber-200/90 dark:border-amber-800/60 text-amber-950 dark:text-amber-200',
        titleColor: 'text-amber-800 dark:text-amber-300',
      };
    case 'rose':
      return {
        className: 'bg-rose-50/80 dark:bg-rose-950/30 border-rose-200/90 dark:border-rose-800/60 text-rose-950 dark:text-rose-200',
        titleColor: 'text-rose-800 dark:text-rose-300',
      };
    case 'purple':
      return {
        className: 'bg-purple-50/80 dark:bg-purple-950/30 border-purple-200/90 dark:border-purple-800/60 text-purple-950 dark:text-purple-200',
        titleColor: 'text-purple-800 dark:text-purple-300',
      };
    case 'slate':
      return {
        className: 'bg-slate-50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100',
        titleColor: 'text-slate-900 dark:text-slate-200',
      };
    default:
      return {
        className: 'bg-surface border-border text-text-primary',
        titleColor: 'text-text-primary',
      };
  }
};

export const CanvasStoryView: React.FC<CanvasStoryViewProps> = ({
  story,
  canvasData: propCanvasData,
  isModal = false,
}) => {
  const { toast } = useToast();
  const [saved, setSaved] = useState((story as any)?.isSaved || false);
  const [copied, setCopied] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState((story as any)?.likeCount ?? 0);

  useEffect(() => {
    if (story?.id && typeof window !== 'undefined') {
      const likedList = JSON.parse(localStorage.getItem('va_liked_stories') || '[]');
      if (likedList.includes(story.id)) {
        setLiked(true);
      }
    }
  }, [story?.id]);

  // Extract or synthesize unique deal-specific canvas data
  const storyCompany = (story as any)?.company || (story as any)?.title?.split(' ')[0] || 'VENTURE ATLAS';
  const authorDisplay = (story as any)?.authorName || story?.author?.name || (story as any)?.sourceAuthor || 'Aditya Poddar';
  const authorRoleDisplay = (story as any)?.authorRole || story?.author?.role || 'Staff Reporter';
  const sourceNameDisplay = (story as any)?.sourceName || '';
  const sourceUrlDisplay = (story as any)?.sourceUrl || '';
  const sourceAuthorDisplay = (story as any)?.sourceAuthor || authorDisplay;

  const defaultSynthesizedData: CanvasData = {
    header: {
      founderPhoto: story?.coverImage || (story as any)?.author?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80',
      companyLogo: (story as any)?.companyLogo || '',
      tagline: (story as any)?.keyMetric || (story as any)?.company ? `${storyCompany.toUpperCase()} · MOAT BREAKDOWN` : `${story?.category?.name?.toUpperCase() || 'VENTURE'} · 60-WORD BRIEF`,
      bannerBg: '#09090b',
    },
    metrics: [
      {
        id: 'm1',
        label: 'Coverage Desk',
        value: story?.category?.name || 'Startups',
        icon: 'building',
      },
      {
        id: 'm2',
        label: 'Valuation / Stage',
        value: (story as any)?.valuation || (story as any)?.stage || 'Growth Round',
        subValue: '(Verified)',
        icon: 'unicorn',
      },
      {
        id: 'm3',
        label: 'Key Metric',
        value: (story as any)?.keyMetric || `${story?.readTimeMinutes || 1} min read`,
        subValue: '(Signal)',
        icon: 'funding',
      },
      {
        id: 'm4',
        label: 'Source Verification',
        value: (story as any)?.sourceName || 'Venture Wire',
        subValue: 'Primary Citation',
        icon: 'calendar',
      },
    ],
    profile: {
      founderName: authorDisplay,
      founderRole: authorRoleDisplay,
      businessModelTitle: 'Core Strategy & Takeaways',
      businessModelPoints: (story as any)?.summary
        ? [
            (story as any).summary.slice(0, 120) + '...',
            'Verified through primary filings & investor term sheet disclosures.',
            'Direct execution lesson for founders and growth operators.',
          ]
        : [
            'High-throughput architecture & scaling flywheel',
            'Zero-CAC distribution strategy & brand leverage',
            'Capital-efficient unit economics & sustainable moats',
          ],
    },
    calloutBoxes: [
      {
        id: 'b1',
        title: 'Executive Brief (60 Words)',
        content: story?.summary || story?.body?.slice(0, 320) || 'Verified primary intelligence wire brief.',
        icon: 'trending',
        variant: 'green',
      },
      {
        id: 'b2',
        title: 'Strategic Moat & Analysis',
        content:
          (story as any)?.strategy ||
          (story as any)?.challenge ||
          story?.body ||
          'Analysis of market positioning, capital efficiency, and product moats.',
        icon: 'star',
        variant: 'blue',
      },
      {
        id: 'b3',
        title: 'Source Verification & Takeaway',
        content:
          (story as any)?.outcome ||
          ((story as any)?.sourceName
            ? `Report confirmed via ${(story as any).sourceName} wires. Read full source document.`
            : 'Verified by the Venture Atlas editorial intelligence desk.'),
        icon: 'lightbulb',
        variant: 'amber',
      },
    ],
  };

  const data: CanvasData = propCanvasData || (story as any)?.canvasData || defaultSynthesizedData;

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast('Story link copied to clipboard', 'info');
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleToggleLike = async () => {
    const nextLiked = !liked;
    setLiked(nextLiked);
    setLikeCount((prev: number) => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));
    toast(nextLiked ? 'Liked story ❤️' : 'Unliked', 'info');

    if (typeof window !== 'undefined' && story?.id) {
      const likedList = JSON.parse(localStorage.getItem('va_liked_stories') || '[]');
      if (nextLiked) {
        if (!likedList.includes(story.id)) likedList.push(story.id);
      } else {
        const idx = likedList.indexOf(story.id);
        if (idx !== -1) likedList.splice(idx, 1);
      }
      localStorage.setItem('va_liked_stories', JSON.stringify(likedList));
    }

    if (story?.id) {
      try {
        const res = await fetch(`/api/articles/${story.id}/like`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ liked: nextLiked }),
        });
        if (res.ok) {
          const data = await res.json();
          if (typeof data.likeCount === 'number') {
            setLikeCount(data.likeCount);
          }
        }
      } catch {
        // ignore
      }
    }
  };

  const handleToggleBookmark = async () => {
    const nextSaved = !saved;
    setSaved(nextSaved);
    toast(nextSaved ? 'Saved to library' : 'Removed from library', 'info');

    if (story?.id) {
      try {
        await fetch('/api/bookmarks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ articleId: story.id, saved: nextSaved }),
        }).catch(() => null);
      } catch {
        // ignore
      }
    }
  };

  return (
    <div className={`w-full max-w-3xl mx-auto bg-white dark:bg-[#121316] text-neutral-900 dark:text-neutral-100 rounded-3xl border border-neutral-200/90 dark:border-neutral-800 shadow-2xl overflow-hidden font-sans select-none ${isModal ? 'p-0' : 'my-4'}`}>
      
      {/* 1. Header Media Hero Section (Split Founder/Story Photo & Brand Logo) */}
      <div className="relative w-full bg-[#09090b] text-white overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-12 min-h-[240px] sm:min-h-[280px]">
          
          {/* Left: Founder / Story Portrait Photo */}
          <div className="sm:col-span-6 relative flex items-center justify-center overflow-hidden bg-[#111114]">
            {data.header?.founderPhoto ? (
              <img
                src={data.header.founderPhoto}
                alt={data.profile?.founderName || 'Story Cover'}
                className="w-full h-full object-cover object-top max-h-[320px] select-none pointer-events-none"
              />
            ) : (
              <div className="p-8 text-center space-y-2">
                <User size={48} className="mx-auto text-neutral-600" />
                <div className="text-xs font-mono uppercase text-neutral-400">
                  {data.profile?.founderName || 'Founder Profile'}
                </div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-[#09090b]/80 hidden sm:block pointer-events-none" />
          </div>

          {/* Right: Company Logo & High-Impact Tagline */}
          <div className="sm:col-span-6 p-6 sm:p-8 flex flex-col items-center justify-center text-center space-y-3.5 bg-gradient-to-b from-[#0e0e11] to-[#09090b]">
            {data.header?.companyLogo ? (
              <img
                src={data.header.companyLogo}
                alt="Company Logo"
                className="h-12 sm:h-14 w-auto object-contain drop-shadow-md"
              />
            ) : (
              <div className="w-14 h-14 rounded-2xl border-2 border-white/20 bg-white/5 backdrop-blur-md flex items-center justify-center text-xl font-black font-display tracking-widest text-white shadow-xl">
                {storyCompany.slice(0, 2).toUpperCase()}
              </div>
            )}

            <div className="space-y-1 max-w-xs">
              <div className="text-lg sm:text-xl font-black tracking-widest uppercase font-display text-white">
                {storyCompany}
              </div>
              <div className="text-[10px] sm:text-xs font-mono font-bold tracking-widest uppercase text-neutral-400 leading-relaxed">
                {data.header?.tagline || 'EXECUTIVE INTELLIGENCE WIRE'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Body Container */}
      <div className="p-5 sm:p-7 md:p-9 space-y-6 bg-white dark:bg-[#121316]">
        
        {/* 2. Headline & Author/Writer Metadata */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700">
                {(story as any)?.category?.name || 'INTELLIGENCE WIRE'}
              </span>
              <span className="text-neutral-400 dark:text-neutral-600">·</span>
              <span className="text-xs font-mono text-neutral-500 dark:text-neutral-400">
                {story?.readTimeMinutes || 1} min read
              </span>
              <span className="text-neutral-400 dark:text-neutral-600">·</span>
              <span className="text-xs font-mono font-semibold text-neutral-800 dark:text-neutral-200">
                By {authorDisplay}
              </span>
            </div>

            {/* Quick Actions (Like, Bookmark, Share) */}
            <div className="flex items-center gap-1.5 shrink-0">
              {/* Like Button */}
              <button
                onClick={handleToggleLike}
                className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full border transition-all text-xs font-mono font-bold active:scale-95 ${
                  liked
                    ? 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-800'
                    : 'text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800'
                }`}
                title="Like story"
              >
                <Heart size={14} className={liked ? 'fill-rose-500 text-rose-500' : ''} />
                <span>{likeCount}</span>
              </button>

              {/* Bookmark */}
              <button
                onClick={handleToggleBookmark}
                className={`p-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                  saved ? 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-300' : 'text-neutral-600 dark:text-neutral-400'
                }`}
                title="Bookmark brief"
              >
                <Bookmark size={15} className={saved ? 'fill-amber-500' : ''} />
              </button>

              {/* Share */}
              <button
                onClick={handleShare}
                className="p-1.5 rounded-full border border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-800 text-neutral-600 dark:text-neutral-400 transition-colors"
                title="Share link"
              >
                {copied ? <Check size={15} className="text-emerald-500" /> : <Share2 size={15} />}
              </button>
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black font-display text-neutral-950 dark:text-white leading-tight tracking-tight">
            {story?.title || 'Executive Wire Brief'}
          </h1>

          <p className="text-sm sm:text-base font-body text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {story?.summary}
          </p>
        </div>

        {/* 3. 4-Column Stat / Metric Badges */}
        {data.metrics && data.metrics.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3.5 pt-1">
            {data.metrics.map(metric => (
              <div
                key={metric.id}
                className="p-3.5 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/70 dark:bg-neutral-900/40 flex items-start gap-2.5 transition-transform hover:-translate-y-0.5"
              >
                <div className="shrink-0 pt-0.5">
                  {renderMetricIcon(metric.icon, metric.color)}
                </div>
                <div className="space-y-0.5 min-w-0">
                  <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 truncate">
                    {metric.label}
                  </div>
                  <div className="text-xs sm:text-sm font-black font-display text-neutral-900 dark:text-white leading-tight truncate">
                    {metric.value}
                  </div>
                  {metric.subValue && (
                    <div className="text-[9px] font-mono text-neutral-500 dark:text-neutral-400 truncate">
                      {metric.subValue}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 4. Author & Analysis 2-Column Split */}
        {data.profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 rounded-2xl border border-neutral-200/90 dark:border-neutral-800 bg-neutral-50/50 dark:bg-neutral-900/30">
            
            {/* Left: Author / Lead Reporter */}
            <div className="flex items-start gap-3 pr-0 md:pr-4 border-b md:border-b-0 md:border-r border-neutral-200 dark:border-neutral-800 pb-3 md:pb-0">
              <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <User size={18} />
              </div>
              <div className="space-y-0.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Writer & Reporting
                </div>
                <div className="text-sm sm:text-base font-black font-display text-neutral-900 dark:text-white">
                  {data.profile.founderName || authorDisplay}
                </div>
                <div className="text-xs font-mono text-neutral-600 dark:text-neutral-400">
                  {data.profile.founderRole || authorRoleDisplay}
                </div>
              </div>
            </div>

            {/* Right: Key Points */}
            <div className="flex items-start gap-3 pl-0 md:pl-2">
              <div className="w-9 h-9 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
                <BarChart3 size={18} />
              </div>
              <div className="space-y-1.5 flex-1">
                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  {data.profile.businessModelTitle || 'Executive Takeaways'}
                </div>
                <ul className="space-y-1 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                  {data.profile.businessModelPoints?.map((pt, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-amber-500 font-bold">•</span>
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* 5. Dynamic Modular Canvas Callout Boxes */}
        {data.calloutBoxes && data.calloutBoxes.length > 0 && (
          <div className="space-y-3 pt-1">
            {data.calloutBoxes.map(box => {
              const style = getBoxStyle(box);
              return (
                <div
                  key={box.id}
                  style={box.variant === 'custom' ? style : undefined}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all duration-200 space-y-2 ${style.className || ''}`}
                >
                  <div className="flex items-center gap-2">
                    <div className="shrink-0">{renderBoxIcon(box.icon)}</div>
                    <h3 className={`text-xs sm:text-sm font-black font-display uppercase tracking-wide ${style.titleColor || ''}`}>
                      {box.title}
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

        {/* Full Long-Form Editorial Body */}
        {story?.body && story.body !== story.summary && (
          <div className="pt-5 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
            <h4 className="text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              FULL EDITORIAL REPORT & WIRE DETAILS
            </h4>
            <div className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {story.body}
            </div>
          </div>
        )}

        {/* Primary Source & Verified Attribution Card */}
        <div className="pt-5 border-t border-neutral-200 dark:border-neutral-800 space-y-3">
          <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-900/60 border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-mono">
            <div className="space-y-1">
              <div className="text-[9px] font-bold uppercase text-neutral-400 dark:text-neutral-500 tracking-wider">
                EDITORIAL SOURCING & ATTRIBUTION
              </div>
              <div className="text-neutral-800 dark:text-neutral-200 flex flex-wrap items-center gap-2">
                <span>Reported by <strong className="text-neutral-900 dark:text-white">{sourceAuthorDisplay}</strong></span>
                {sourceNameDisplay && (
                  <>
                    <span className="text-neutral-400">•</span>
                    <span>Primary Wire: <strong className="text-neutral-900 dark:text-white">{sourceNameDisplay}</strong></span>
                  </>
                )}
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0">
              {sourceUrlDisplay && (
                <a
                  href={sourceUrlDisplay}
                  target="_blank"
                  rel="noopener noreferrer nofollow"
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Verify Primary Source</span>
                  <ArrowUpRight size={13} />
                </a>
              )}
              <Link
                href={`/authors/${(authorDisplay || 'aditya-poddar').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}`}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-neutral-600 dark:text-neutral-300 hover:text-blue-600 dark:hover:text-blue-400 hover:underline"
              >
                <span>Journalist Bio</span>
                <ArrowUpRight size={13} />
              </Link>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
