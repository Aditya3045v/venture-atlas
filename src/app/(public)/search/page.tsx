'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Search as SearchIcon, X, Clock, ArrowRight, History, Sparkles, BookOpen, Briefcase, FileText, ChevronRight } from 'lucide-react';
import { ArticleItem, CaseStudyItem, BlogItem } from '@/types';
import { StoryCard } from '@/components/news/StoryCard';
import { StoryDetailSheet } from '@/components/news/StoryDetailSheet';

const QUICK_TAGS = ['AI Inference', 'Series C', 'Fintech', 'Africa', 'Sequoia', 'YC', 'Carbon', 'Fed', 'Semiconductors', 'Linear', 'CRED'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'articles' | 'case-studies' | 'blogs'>('all');
  const [results, setResults] = useState<{
    articles: ArticleItem[];
    caseStudies: CaseStudyItem[];
    blogs: BlogItem[];
    total: number;
  }>({ articles: [], caseStudies: [], blogs: [], total: 0 });
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedStory, setSelectedStory] = useState<ArticleItem | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = JSON.parse(localStorage.getItem('va_recent_searches') || '[]');
      setRecentSearches(saved.slice(0, 6));
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const termClean = term.trim();
    const updated = [termClean, ...recentSearches.filter(s => s.toLowerCase() !== termClean.toLowerCase())].slice(0, 6);
    setRecentSearches(updated);
    if (typeof window !== 'undefined') {
      localStorage.setItem('va_recent_searches', JSON.stringify(updated));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('va_recent_searches');
    }
  };

  useEffect(() => {
    const handleSearch = async () => {
      const searchTerm = query.trim();
      if (!searchTerm) {
        setResults({ articles: [], caseStudies: [], blogs: [], total: 0 });
        setSearched(false);
        return;
      }

      setLoading(true);
      setSearched(true);

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        setResults({
          articles: data.articles || [],
          caseStudies: data.caseStudies || [],
          blogs: data.blogs || [],
          total: data.total || 0,
        });
        saveRecentSearch(searchTerm);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(handleSearch, 250);
    return () => clearTimeout(timer);
  }, [query]);

  const handleTagClick = (tag: string) => {
    setQuery(tag);
    inputRef.current?.focus();
  };

  const displayedArticles = results.articles;
  const displayedCaseStudies = results.caseStudies;
  const displayedBlogs = results.blogs;

  return (
    <div className="max-w-4xl mx-auto space-y-8 select-none">
      {/* Search Header */}
      <div className="p-6 sm:p-8 rounded-3xl border border-border bg-surface shadow-card space-y-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-blue-600 dark:text-amber-400 mb-1">
            <Sparkles size={14} />
            <span>Semantic Trigram Search</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
            Intelligence Search
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-1">
            Search 60-word briefs, teardowns, and essays across the Venture Atlas database.
          </p>
        </div>

        {/* Search Input Bar */}
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search deals, founders, teardowns, term sheets..."
            className="w-full h-13 pl-12 pr-10 text-sm font-medium border border-border rounded-2xl bg-surface-muted text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-inner"
          />
          <SearchIcon size={19} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-tertiary pointer-events-none" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface transition-colors"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Recent Searches */}
        {recentSearches.length > 0 && !query && (
          <div className="space-y-2 pt-1 border-t border-border/60">
            <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary">
              <span className="flex items-center gap-1.5">
                <History size={12} />
                <span>Recent Searches</span>
              </span>
              <button
                onClick={clearRecentSearches}
                className="hover:text-text-primary transition-colors text-[10px]"
              >
                Clear History
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map(term => (
                <button
                  key={term}
                  onClick={() => handleTagClick(term)}
                  className="px-3 py-1 rounded-xl bg-surface-muted hover:bg-surface border border-border/80 text-xs font-mono text-text-secondary hover:text-text-primary transition-colors flex items-center gap-1.5"
                >
                  <Clock size={11} className="text-text-tertiary" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Trending Keywords */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-[11px] font-mono text-text-tertiary uppercase mr-1">Trending:</span>
          {QUICK_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-3 py-1 rounded-xl text-xs font-mono transition-all ${
                query.toLowerCase() === tag.toLowerCase()
                  ? 'bg-blue-600 text-white font-bold shadow-xs'
                  : 'bg-surface-muted hover:bg-surface border border-border text-text-secondary hover:text-text-primary'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Content Type Filter Tabs */}
      {searched && (
        <div className="flex items-center justify-between border-b border-border/80 pb-3">
          <div className="flex items-center gap-2">
            {[
              { id: 'all', label: 'All Results', count: results.total },
              { id: 'articles', label: 'News Briefs', count: results.articles.length },
              { id: 'case-studies', label: 'Case Studies', count: results.caseStudies.length },
              { id: 'blogs', label: 'Essays', count: results.blogs.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 ${
                  activeTab === tab.id
                    ? 'bg-text-primary text-background shadow-xs'
                    : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
                }`}
              >
                <span>{tab.label}</span>
                <span className="text-[10px] opacity-75">({tab.count})</span>
              </button>
            ))}
          </div>

          <div className="text-xs font-mono text-text-tertiary hidden sm:block">
            {results.total} matches found
          </div>
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="p-6 rounded-2xl bg-surface border border-border animate-pulse space-y-3">
              <div className="h-4 w-28 bg-surface-muted rounded" />
              <div className="h-6 w-3/4 bg-surface-muted rounded" />
              <div className="h-4 w-full bg-surface-muted rounded" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State / Initial Prompt */}
      {!searched && !loading && (
        <div className="text-center py-16 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-surface-muted border border-border flex items-center justify-center mx-auto text-text-tertiary">
            <SearchIcon size={22} />
          </div>
          <h3 className="text-base font-bold font-display text-text-primary">
            Search Across Executive Intelligence
          </h3>
          <p className="text-xs font-mono text-text-tertiary max-w-sm mx-auto">
            Type any startup, founder, term sheet clause, or technology to filter verified data in real time.
          </p>
        </div>
      )}

      {/* No Results Found */}
      {searched && !loading && results.total === 0 && (
        <div className="p-10 rounded-3xl bg-surface border border-border text-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-surface-muted border border-border flex items-center justify-center mx-auto text-text-tertiary">
            <X size={22} />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold font-display text-text-primary">
              No intelligence found for "{query}"
            </h3>
            <p className="text-xs font-mono text-text-tertiary max-w-md mx-auto">
              Check spelling or try broad keywords like "Fintech", "Series C", "LLM", or "Stripe".
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-1.5 pt-2">
            {QUICK_TAGS.slice(0, 5).map(tag => (
              <button
                key={tag}
                onClick={() => setQuery(tag)}
                className="px-3 py-1 rounded-xl bg-surface-muted hover:bg-surface border border-border text-xs font-mono text-text-secondary"
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Grouped Results Display */}
      {searched && !loading && results.total > 0 && (
        <div className="space-y-10">
          {/* Section: News Briefs */}
          {(activeTab === 'all' || activeTab === 'articles') && displayedArticles.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-blue-600" />
                  <h2 className="text-base font-black font-display uppercase tracking-tight text-text-primary">
                    Executive News Briefs ({displayedArticles.length})
                  </h2>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedArticles.map(article => (
                  <StoryCard
                    key={article.id}
                    article={article}
                    onPreviewClick={setSelectedStory}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Section: Startup Case Studies */}
          {(activeTab === 'all' || activeTab === 'case-studies') && displayedCaseStudies.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <Briefcase size={16} className="text-amber-500" />
                <h2 className="text-base font-black font-display uppercase tracking-tight text-text-primary">
                  Startup Playbooks & Case Studies ({displayedCaseStudies.length})
                </h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayedCaseStudies.map(cs => (
                  <Link
                    key={cs.id}
                    href={`/case-studies/${cs.slug}`}
                    className="p-5 rounded-2xl bg-surface border border-border hover:border-blue-500/40 transition-all shadow-xs block group space-y-2.5"
                  >
                    <div className="flex items-center justify-between text-[11px] font-mono text-text-tertiary">
                      <span className="font-bold text-text-primary">{cs.company}</span>
                      <span>{cs.valuation || 'Case Study'}</span>
                    </div>
                    <h3 className="font-bold font-display text-sm sm:text-base text-text-primary group-hover:text-blue-600 transition-colors leading-snug">
                      {cs.title}
                    </h3>
                    <p className="text-xs font-body text-text-secondary line-clamp-2">
                      {cs.summary}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Section: Long-Form Essays */}
          {(activeTab === 'all' || activeTab === 'blogs') && displayedBlogs.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-purple-500" />
                <h2 className="text-base font-black font-display uppercase tracking-tight text-text-primary">
                  Editorial Essays ({displayedBlogs.length})
                </h2>
              </div>
              <div className="space-y-3">
                {displayedBlogs.map(blog => (
                  <Link
                    key={blog.id}
                    href={`/blogs/${blog.slug}`}
                    className="p-5 rounded-2xl bg-surface border border-border hover:border-purple-500/40 transition-all shadow-xs block group"
                  >
                    <div className="flex items-center justify-between text-xs font-mono text-text-tertiary mb-1">
                      <span className="font-bold text-purple-600">{blog.category?.name || 'Essay'}</span>
                      <span>{blog.readTimeMinutes} min read</span>
                    </div>
                    <h3 className="font-bold font-display text-base text-text-primary group-hover:text-purple-600 transition-colors">
                      {blog.title}
                    </h3>
                    <p className="text-xs font-body text-text-secondary line-clamp-2 mt-1">
                      {blog.excerpt}
                    </p>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </div>
      )}

      {/* Story Detail Sheet Modal on click */}
      <StoryDetailSheet
        article={selectedStory}
        onClose={() => setSelectedStory(null)}
      />
    </div>
  );
}
