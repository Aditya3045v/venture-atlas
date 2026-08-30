'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArticleItem, CategoryItem, BlogItem, CaseStudyItem } from '@/types';
import { StoryCard } from './StoryCard';
import { FeaturedStory } from './FeaturedStory';
import { CategoryStrip } from './CategoryStrip';
import { useToast } from '../providers/ToastProvider';
import {
  IconLockFilled,
  IconLockOpen,
  IconTrendingUp,
  IconBriefcase,
  IconBook2,
  IconArrowNarrowRight,
  IconCircleCheckFilled,
  IconShieldLock,
} from '@tabler/icons-react';

interface GatedNewsFeedProps {
  categories: CategoryItem[];
  articles: ArticleItem[];
  blogs: BlogItem[];
  caseStudies: CaseStudyItem[];
  initialUnlocked?: boolean;
}

export const GatedNewsFeed: React.FC<GatedNewsFeedProps> = ({
  categories,
  articles,
  blogs,
  caseStudies,
  initialUnlocked = false,
}) => {
  const { toast } = useToast();
  const [isUnlocked, setIsUnlocked] = useState<boolean>(initialUnlocked);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check cookie or local storage
    const unlockedCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('va_unlocked_user='));
    const sessionCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('va_session_user='));

    if (unlockedCookie || sessionCookie || localStorage.getItem('va_unlocked_user')) {
      setIsUnlocked(true);
    }
  }, []);

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      toast('Please enter a valid work email address', 'error');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/subscribers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();

      if (res.ok) {
        localStorage.setItem('va_unlocked_user', email);
        setIsUnlocked(true);
        toast('Wire access unlocked! Enjoy the news.', 'success');
      } else {
        toast(data.error || 'Failed to unlock', 'error');
      }
    } catch {
      toast('Network error. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];
  const feedArticles = articles.filter(a => a.id !== featuredArticle?.id);

  return (
    <div className="relative w-full space-y-12 select-none">
      {/* Category Strip */}
      <div className="space-y-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/80 pb-2">
          <div className="flex items-center gap-2">
            <IconTrendingUp size={18} className="text-amber-400" />
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-text-primary">
              News Desks & Live Streams
            </h2>
          </div>
          <div className="text-xs font-mono text-text-tertiary">
            {isUnlocked ? 'LIVE · 60-WORD BRIEFS' : '🔒 EMAIL REQUIRED TO UNLOCK'}
          </div>
        </div>

        <CategoryStrip categories={categories} activeSlug="all" />
      </div>

      {/* Gated Feed Wrapper */}
      <div className="relative">
        {/* Floating Unlock Gate Modal/Banner (Shown when blurred) */}
        {!isUnlocked && (
          <div className="absolute inset-x-0 top-12 z-30 flex justify-center px-4">
            <div className="w-full max-w-lg p-6 sm:p-8 rounded-3xl ios-glass bg-surface/95 dark:bg-[#0A0A0C]/95 border-2 border-amber-400/50 shadow-[0_20px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-center space-y-5 animate-slideUp">
              <div className="w-12 h-12 rounded-2xl bg-amber-400/15 text-amber-400 border border-amber-400/30 flex items-center justify-center mx-auto shadow-sm">
                <IconShieldLock size={24} />
              </div>

              <div className="space-y-1.5">
                <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400">
                  EXECUTIVE SUBSCRIBER ACCESS
                </div>
                <h3 className="text-xl sm:text-2xl font-black font-display uppercase tracking-tight text-text-primary">
                  Unlock the Live News Wire
                </h3>
                <p className="text-xs sm:text-sm font-body text-text-secondary leading-relaxed">
                  Enter your email to instantly read breaking 60-word briefs, audio teardowns, and proprietary case studies.
                </p>
              </div>

              <form onSubmit={handleUnlock} className="space-y-3">
                <div className="flex flex-col sm:flex-row items-center gap-2">
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Enter your work email..."
                    required
                    className="w-full bg-surface-muted px-4 py-2.5 rounded-full border border-border text-xs sm:text-sm font-body text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-amber-400"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-amber-400 hover:bg-amber-300 text-black text-xs font-black font-mono tracking-wider transition-all duration-150 active:scale-95 shadow-md shrink-0 flex items-center justify-center gap-1.5"
                  >
                    {loading ? 'Unlocking...' : 'Unlock Now'}
                    <IconLockOpen size={14} />
                  </button>
                </div>

                <div className="text-[10px] font-mono text-text-tertiary">
                  Instant free access · Stored securely in Supabase · Zero spam
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Content Stream (Blurred if not unlocked) */}
        <div
          className={`space-y-12 transition-all duration-700 ${
            !isUnlocked
              ? 'filter blur-[10px] sm:blur-[12px] opacity-40 pointer-events-none select-none overflow-hidden max-h-[900px]'
              : 'filter-none opacity-100'
          }`}
        >
          {/* Featured Hero Card */}
          {featuredArticle && <FeaturedStory article={featuredArticle} />}

          {/* News Feed Grid */}
          <section className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {feedArticles.map(article => (
                <StoryCard key={article.id} article={article} />
              ))}
            </div>
          </section>

          {/* Startup Case Studies */}
          {caseStudies.length > 0 && (
            <section className="pt-10 border-t border-border/80 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconBriefcase size={20} className="text-amber-400" />
                  <div>
                    <h2 className="text-xl font-black font-display text-text-primary uppercase tracking-tight">
                      Startup Architecture & Case Studies
                    </h2>
                    <p className="text-xs font-mono text-text-tertiary mt-0.5">
                      Deep breakdowns of scaling playbooks, zero-CAC distribution, and unit economics
                    </p>
                  </div>
                </div>

                <Link
                  href="/case-studies"
                  className="inline-flex items-center gap-1 text-xs font-bold font-mono uppercase text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>View all teardowns</span>
                  <IconArrowNarrowRight size={15} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {caseStudies.map((cs, idx) => (
                  <Link
                    key={cs.id}
                    href={`/case-studies/${cs.slug}`}
                    className={`ios-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 group transition-all duration-300 hover:scale-[1.01] ${
                      idx % 2 === 0
                        ? 'bg-gradient-to-br from-blue-500/[0.06] via-surface-card to-surface-card dark:from-blue-500/[0.08] dark:via-[#111113] dark:to-[#111113] border-blue-500/20 hover:border-blue-500/40'
                        : 'bg-gradient-to-br from-emerald-500/[0.06] via-surface-card to-surface-card dark:from-emerald-500/[0.08] dark:via-[#111113] dark:to-[#111113] border-emerald-500/20 hover:border-emerald-500/40'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs font-mono">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface-muted text-text-primary border border-border/70">
                            {cs.company}
                          </span>
                          <span className="text-text-tertiary">·</span>
                          <span className="text-text-tertiary">{cs.stage}</span>
                        </div>
                        <span className="text-text-tertiary">{cs.readTimeMinutes} min read</span>
                      </div>

                      <h3 className="text-lg font-bold font-display text-text-primary group-hover:opacity-90 transition-opacity line-clamp-2">
                        {cs.title}
                      </h3>

                      <p className="text-xs sm:text-sm font-body text-text-secondary line-clamp-2 leading-relaxed">
                        {cs.summary}
                      </p>

                      {cs.keyMetric && (
                        <div className="pt-1">
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-surface-muted text-text-primary border border-border/60">
                            <IconTrendingUp size={13} className="text-emerald-400" />
                            <span>{cs.keyMetric}</span>
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono text-text-tertiary">
                      <span>Valuation: <strong className="text-text-primary">{cs.valuation || 'Private'}</strong></span>
                      <span className="text-text-primary dark:text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Explore playbook →
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Long-Form Essays */}
          {blogs.length > 0 && (
            <section className="pt-10 border-t border-border/80 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <IconBook2 size={20} className="text-amber-400" />
                  <div>
                    <h2 className="text-xl font-black font-display text-text-primary uppercase tracking-tight">
                      Editorial Essays & Deep Dives
                    </h2>
                    <p className="text-xs font-mono text-text-tertiary mt-0.5">
                      Macro perspectives, term sheet mechanics, and LP dynamics
                    </p>
                  </div>
                </div>

                <Link
                  href="/blogs"
                  className="inline-flex items-center gap-1 text-xs font-bold font-mono uppercase text-amber-400 hover:text-amber-300 transition-colors"
                >
                  <span>View all essays</span>
                  <IconArrowNarrowRight size={15} />
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {blogs.map((blog, idx) => {
                  const cardBgGradients = [
                    'bg-gradient-to-br from-amber-500/[0.07] via-surface-card to-surface-card dark:from-amber-500/[0.08] dark:via-[#111113] dark:to-[#111113] border-amber-500/20 hover:border-amber-500/40',
                    'bg-gradient-to-br from-indigo-500/[0.07] via-surface-card to-surface-card dark:from-indigo-500/[0.08] dark:via-[#111113] dark:to-[#111113] border-indigo-500/20 hover:border-indigo-500/40',
                  ];

                  return (
                    <Link
                      key={blog.id}
                      href={`/blogs/${blog.slug}`}
                      className={`ios-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 group transition-all duration-300 hover:scale-[1.01] ${
                        cardBgGradients[idx % cardBgGradients.length]
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-xs font-mono text-text-tertiary">
                          <span
                            className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase text-white shadow-xs"
                            style={{ backgroundColor: blog.category?.color || '#F59E0B' }}
                          >
                            {blog.category?.name || 'Essay'}
                          </span>
                          <span>{blog.readTimeMinutes} min read</span>
                        </div>

                        <h3 className="text-lg font-bold font-display text-text-primary group-hover:opacity-90 transition-opacity line-clamp-2">
                          {blog.title}
                        </h3>

                        <p className="text-xs sm:text-sm font-body text-text-secondary line-clamp-3 leading-relaxed">
                          {blog.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono text-text-tertiary">
                        <span>By {blog.author?.name || 'Venture Atlas Editorial'}</span>
                        <span className="text-text-primary dark:text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                          Read essay →
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};
