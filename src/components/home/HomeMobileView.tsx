'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Search,
  SlidersHorizontal,
  Bookmark,
  Heart,
  ChevronRight,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowUpRight,
  Compass,
  Home as HomeIcon,
  User as UserIcon,
  Bell,
  Radio,
  Briefcase,
  Share2,
} from 'lucide-react';
import { ArticleItem, CaseStudyItem, BlogItem, CategoryItem } from '@/types';
import { StoryDetailSheet } from '@/components/news/StoryDetailSheet';
import { formatDistanceToNow } from 'date-fns';

interface HomeMobileViewProps {
  articles: ArticleItem[];
  caseStudies: CaseStudyItem[];
  blogs: BlogItem[];
  categories?: CategoryItem[];
}

const CATEGORY_COLORS: Record<string, { bg: string; text: string }> = {
  unicorn: { bg: 'bg-pink-500/15 border-pink-500/30 text-pink-600 dark:text-pink-400', text: 'text-pink-600' },
  failure: { bg: 'bg-red-500/15 border-red-500/30 text-red-600 dark:text-red-400', text: 'text-red-600' },
  finance: { bg: 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400', text: 'text-emerald-600' },
  'crypto-web3': { bg: 'bg-cyan-500/15 border-cyan-500/30 text-cyan-600 dark:text-cyan-400', text: 'text-cyan-600' },
  'founder-biography': { bg: 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400', text: 'text-amber-600' },
};

export const HomeMobileView: React.FC<HomeMobileViewProps> = ({
  articles,
  caseStudies,
  blogs,
  categories = [],
}) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeStory, setActiveStory] = useState<ArticleItem | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'explore' | 'bookmarks' | 'profile'>('home');

  // Featured stories for the top horizontal snap-carousel
  const featuredStories = articles.filter(a => a.isFeatured || a.isTrending).slice(0, 4);
  const carouselStories = featuredStories.length > 0 ? featuredStories : articles.slice(0, 4);

  // Filtered stories for the list section
  const filteredArticles = articles.filter(article => {
    const matchesCategory =
      activeCategory === 'all' ||
      article.category?.slug === activeCategory ||
      article.categoryId === activeCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categoryChips = [
    { label: 'All', slug: 'all', color: 'bg-blue-600 text-white' },
    { label: 'Unicorn', slug: 'unicorn', color: 'bg-pink-600 text-white' },
    { label: 'Failure', slug: 'failure', color: 'bg-red-600 text-white' },
    { label: 'Finance', slug: 'finance', color: 'bg-emerald-600 text-white' },
    { label: 'Crypto Web3', slug: 'crypto-web3', color: 'bg-cyan-600 text-white' },
    { label: 'Founder Biography', slug: 'founder-biography', color: 'bg-amber-600 text-white' },
  ];

  return (
    <div className="w-full max-w-lg mx-auto pb-28 pt-2 select-none font-sans space-y-6">
      
      {/* 1. Header & Greeting (Image 1 Screen 1: "Hi, Investor!" + User Avatar) */}
      <div className="flex items-center justify-between pt-1">
        <div className="space-y-0.5">
          <div className="text-xs font-mono font-medium text-text-tertiary">
            Hi, Investor! 👋
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display tracking-tight text-text-primary">
            Explore Today's Wire
          </h1>
        </div>

        {/* User Profile Avatar with Online Status */}
        <Link href="/account" className="relative group">
          <img
            src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80"
            alt="User avatar"
            className="w-10 h-10 rounded-full object-cover border-2 border-border shadow-xs group-hover:scale-105 transition-transform"
          />
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 border-2 border-surface rounded-full" />
        </Link>
      </div>

      {/* 2. Modern Pill Search Bar (Matching Image 1 & 2) */}
      <div className="relative flex items-center">
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder="Search deals, founders, teardowns..."
          className="w-full pl-11 pr-11 py-3.5 rounded-2xl bg-surface-muted/90 dark:bg-[#151619] border border-border/80 text-xs font-mono text-text-primary placeholder:text-text-tertiary focus:outline-none focus:border-blue-500 transition-all shadow-xs"
        />
        <Search size={17} className="absolute left-4 text-text-tertiary pointer-events-none" />
        <button
          onClick={() => setActiveCategory('all')}
          className="absolute right-3.5 p-1.5 rounded-xl text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors"
          title="Filters"
        >
          <SlidersHorizontal size={15} />
        </button>
      </div>

      {/* 3. Featured / Trending Carousel Section (Matching Image 1 Screen 1 & Image 2 Screen 2) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black font-display uppercase tracking-tight text-text-primary">
            Featured
          </h2>
          <Link
            href="/categories/funding"
            className="text-xs font-mono font-bold text-text-tertiary hover:text-text-primary transition-colors"
          >
            View all
          </Link>
        </div>

        {/* Horizontal Snap-Scroll Carousel */}
        <div className="flex items-stretch gap-4 overflow-x-auto no-scrollbar py-1 snap-x snap-mandatory">
          {carouselStories.map((story, idx) => (
            <div
              key={story.id}
              onClick={() => setActiveStory(story)}
              className="snap-center shrink-0 w-[240px] sm:w-[260px] h-[300px] sm:h-[320px] rounded-[28px] overflow-hidden relative shadow-md group cursor-pointer border border-border/60 transition-transform active:scale-[0.98]"
            >
              {/* Background Cover Image */}
              <img
                src={
                  story.coverImage ||
                  'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=600&q=80'
                }
                alt={story.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
              />

              {/* Dark Linear Gradient for legibility */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10" />

              {/* Top Category Tag & Bookmark */}
              <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between z-10">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider text-white shadow-xs backdrop-blur-md ${
                    idx === 0
                      ? 'bg-rose-600/90'
                      : idx === 1
                      ? 'bg-blue-600/90'
                      : idx === 2
                      ? 'bg-emerald-600/90'
                      : 'bg-purple-600/90'
                  }`}
                >
                  {story.category?.name || 'Funding'}
                </span>

                <button
                  onClick={e => {
                    e.stopPropagation();
                    setActiveStory(story);
                  }}
                  className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md border border-white/20 flex items-center justify-center text-white/90 hover:bg-black/80 transition-colors shadow-xs"
                >
                  <Bookmark size={14} />
                </button>
              </div>

              {/* Bottom Title & Reporter attribution */}
              <div className="absolute bottom-4 left-4 right-4 space-y-1.5 text-white z-10">
                <div className="text-[10px] font-mono text-white/70 uppercase">
                  {story.sourceName || 'Wire Brief'} · {story.readTimeMinutes || 1} min
                </div>
                <h3 className="text-sm font-black font-display leading-snug line-clamp-3 text-white drop-shadow-sm">
                  {story.title}
                </h3>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Indicator Dots (Image 2 style) */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {carouselStories.map((_, i) => (
            <span
              key={i}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === 0 ? 'w-5 bg-blue-600' : 'w-1.5 bg-border'
              }`}
            />
          ))}
        </div>
      </section>

      {/* 4. Split Graphic Feature Card (Image 1 Screen 1 Bottom Card) */}
      {articles[1] && (
        <div
          onClick={() => setActiveStory(articles[1])}
          className="p-4 rounded-[26px] bg-surface-muted/90 dark:bg-[#151619] border border-border/70 flex items-center justify-between gap-4 cursor-pointer hover:border-blue-500/50 transition-all shadow-xs active:scale-[0.99]"
        >
          <div className="space-y-1.5 flex-1 min-w-0">
            <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase text-blue-600 dark:text-blue-400 bg-blue-500/10 border border-blue-500/20">
              {articles[1].category?.name || 'Technology'}
            </span>
            <h3 className="text-sm font-bold font-display text-text-primary line-clamp-2 leading-snug">
              {articles[1].title}
            </h3>
            <div className="text-[10px] font-mono text-text-tertiary">
              By {articles[1].authorName || 'Aditya Poddar'} · {articles[1].readTimeMinutes || 1} min
            </div>
          </div>

          {/* Right Cutout Photo Thumbnail */}
          <div className="w-20 h-20 rounded-2xl overflow-hidden bg-surface shrink-0 border border-border/80 shadow-xs">
            <img
              src={
                articles[1].coverImage ||
                'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'
              }
              alt={articles[1].title}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}

      {/* 5. Latest News Section with Colorful Category Grid (Image 1 style) */}
      <section className="space-y-4 pt-2">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-black font-display uppercase tracking-tight text-text-primary">
            Latest News
          </h2>
          <span className="text-xs font-mono text-text-tertiary">
            {filteredArticles.length} briefs
          </span>
        </div>

        {/* 2-Row Colorful Pill Grid (Image 1 Screen 1: World, Tech, Entertainment, Travel...) */}
        <div className="flex flex-wrap gap-2">
          {categoryChips.map(cat => {
            const isActive = activeCategory === cat.slug;
            return (
              <button
                key={cat.slug}
                onClick={() => setActiveCategory(cat.slug)}
                className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold uppercase tracking-tight transition-all active:scale-95 flex items-center gap-1.5 ${
                  isActive
                    ? `${cat.color} shadow-sm scale-105 ring-2 ring-blue-500/30`
                    : 'bg-surface-muted dark:bg-[#151619] text-text-secondary hover:text-text-primary border border-border/70'
                }`}
              >
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Clean Story List Cards (Image 2 style: Left Thumbnail + Right Text + Arrow) */}
        <div className="space-y-3 pt-1">
          {filteredArticles.map(article => {
            const timeAgo = article.publishedAt
              ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
              : 'Recently';

            return (
              <div
                key={article.id}
                onClick={() => setActiveStory(article)}
                className="p-3 rounded-[22px] bg-surface dark:bg-[#121316] border border-border/80 flex items-center gap-3.5 hover:border-blue-500/40 transition-all cursor-pointer shadow-xs active:scale-[0.99] group"
              >
                {/* Left Thumbnail Image with deep rounded corners */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-[18px] overflow-hidden bg-surface-muted shrink-0 relative border border-border/60">
                  {article.coverImage && (
                    <img
                      src={article.coverImage}
                      alt={article.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                </div>

                {/* Right Text Block */}
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="flex items-center justify-between text-[10px] font-mono uppercase tracking-wider text-text-tertiary">
                    <span className="font-bold text-text-secondary truncate max-w-[130px]">
                      {article.sourceName || 'VENTURE WIRE'}
                    </span>
                    <span>{timeAgo}</span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-bold font-display text-text-primary leading-snug line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-amber-400 transition-colors">
                    {article.title}
                  </h4>

                  <div className="flex items-center justify-between pt-0.5 text-[10px] font-mono text-text-tertiary">
                    <span className="text-text-secondary truncate max-w-[140px]">
                      By {article.authorName || 'Staff Reporter'}
                    </span>
                    <span className="text-text-tertiary flex items-center gap-1">
                      <span>{article.readTimeMinutes || 1}m</span>
                      <ChevronRight size={13} className="text-text-tertiary group-hover:translate-x-0.5 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 6. Recommended Startup Teardowns Section (Image 2 style) */}
      {caseStudies.length > 0 && (
        <section className="space-y-3.5 pt-4 border-t border-border/80">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Briefcase size={16} className="text-blue-600 dark:text-amber-400" />
              <h2 className="text-base font-black font-display uppercase tracking-tight text-text-primary">
                Recommended Playbooks
              </h2>
            </div>
            <Link
              href="/case-studies"
              className="text-xs font-mono font-bold text-text-tertiary hover:text-text-primary transition-colors flex items-center gap-0.5"
            >
              <span>See all</span>
              <ChevronRight size={13} />
            </Link>
          </div>

          <div className="space-y-3">
            {caseStudies.map(cs => (
              <Link
                key={cs.id}
                href={`/case-studies/${cs.slug}`}
                className="p-4 rounded-[24px] bg-gradient-to-r from-blue-500/[0.06] via-surface to-surface dark:from-blue-500/[0.08] dark:via-[#121316] dark:to-[#121316] border border-blue-500/20 hover:border-blue-500/40 p-4 block space-y-2 transition-all active:scale-[0.99]"
              >
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-blue-600 text-white shadow-xs">
                    {cs.company}
                  </span>
                  <span className="text-text-tertiary">{cs.stage}</span>
                </div>
                <h4 className="text-sm font-bold font-display text-text-primary line-clamp-2">
                  {cs.title}
                </h4>
                <div className="flex items-center justify-between text-xs font-mono text-text-tertiary pt-1 border-t border-border/50">
                  <span>Valuation: <strong className="text-text-primary">{cs.valuation || 'Private'}</strong></span>
                  <span className="text-blue-600 dark:text-amber-400 font-bold flex items-center gap-1">
                    Playbook →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* 7. Floating Bottom Navigation Bar (Image 2 Mobile Dock Style) */}
      <div className="fixed bottom-4 left-4 right-4 z-40 max-w-md mx-auto">
        <div className="px-6 py-3 rounded-full bg-surface/90 dark:bg-[#0c0d0e]/90 backdrop-blur-xl border border-border/80 shadow-2xl flex items-center justify-between">
          
          {/* Home Tab */}
          <button
            onClick={() => {
              setActiveTab('home');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className={`flex flex-col items-center gap-0.5 transition-colors relative ${
              activeTab === 'home' ? 'text-blue-600 dark:text-amber-400' : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <HomeIcon size={20} />
            <span className="w-1.5 h-1.5 rounded-full bg-current mt-0.5" />
          </button>

          {/* Explore / Desks Tab */}
          <Link
            href="/categories/startups"
            onClick={() => setActiveTab('explore')}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              activeTab === 'explore' ? 'text-blue-600 dark:text-amber-400' : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <Compass size={20} />
          </Link>

          {/* Bookmarks Tab */}
          <Link
            href="/bookmarks"
            onClick={() => setActiveTab('bookmarks')}
            className={`flex flex-col items-center gap-0.5 transition-colors relative ${
              activeTab === 'bookmarks' ? 'text-blue-600 dark:text-amber-400' : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <Bookmark size={20} />
          </Link>

          {/* Account / Admin Tab */}
          <Link
            href="/admin"
            onClick={() => setActiveTab('profile')}
            className={`flex flex-col items-center gap-0.5 transition-colors ${
              activeTab === 'profile' ? 'text-blue-600 dark:text-amber-400' : 'text-text-tertiary hover:text-text-primary'
            }`}
          >
            <UserIcon size={20} />
          </Link>
        </div>
      </div>

      {/* 8. Slide-Over Story Detail Sheet Modal (Image 1 Screen 2 Design) */}
      <StoryDetailSheet
        article={activeStory}
        onClose={() => setActiveStory(null)}
      />

    </div>
  );
};
