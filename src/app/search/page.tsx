'use client';

import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, ArrowUpRight, Clock } from 'lucide-react';
import { ArticleItem } from '../../types';
import { StoryCard } from '../../components/news/StoryCard';

const QUICK_TAGS = ['AI Inference', 'Series C', 'Fintech', 'Africa', 'Sequoia', 'YC', 'Carbon', 'Fed', 'Semiconductors'];

export default function SearchPage() {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [results, setResults] = useState<ArticleItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const handleSearch = async () => {
      const searchTerm = activeTag || query;
      if (!searchTerm.trim()) {
        setResults([]);
        setSearched(false);
        return;
      }

      setLoading(true);
      setSearched(true);

      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(searchTerm)}`);
        const data = await res.json();
        setResults(data.articles || []);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setLoading(false);
      }
    };

    const timer = setTimeout(handleSearch, 250);
    return () => clearTimeout(timer);
  }, [query, activeTag]);

  const handleTagClick = (tag: string) => {
    if (activeTag === tag) {
      setActiveTag(null);
      setQuery('');
    } else {
      setActiveTag(tag);
      setQuery(tag);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Search Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card space-y-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
            Intelligence Search
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-1">
            Search headlines, funding rounds, founders, entities, and sources across the Venture Atlas database.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setActiveTag(null);
            }}
            placeholder="Search keywords, companies, investors, or topics..."
            className="w-full h-12 pl-11 pr-10 text-sm font-medium border border-border rounded-xl bg-surface-muted text-text-primary placeholder:text-text-tertiary focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand transition-all"
          />
          <SearchIcon size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-tertiary" />
          {query && (
            <button
              onClick={() => {
                setQuery('');
                setActiveTag(null);
              }}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-text-tertiary hover:text-text-primary"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Quick Keyword Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <span className="text-xs font-mono text-text-tertiary uppercase mr-1">Trending:</span>
          {QUICK_TAGS.map(tag => (
            <button
              key={tag}
              onClick={() => handleTagClick(tag)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-colors border ${
                activeTag === tag || query === tag
                  ? 'bg-brand text-white border-brand font-bold'
                  : 'bg-surface border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      {loading ? (
        <div className="p-12 text-center text-xs font-mono text-text-tertiary">
          Searching intelligence database...
        </div>
      ) : searched ? (
        <div className="space-y-4">
          <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
            FOUND {results.length} STORY {results.length === 1 ? 'BRIEF' : 'BRIEFS'} FOR "{query || activeTag}"
          </div>

          {results.length === 0 ? (
            <div className="p-12 text-center bg-surface rounded-2xl border border-border">
              <p className="text-sm font-body text-text-secondary">
                No matching stories found. Try broad terms like "AI", "Funding", "Sequoia", or "Markets".
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {results.map(article => (
                <StoryCard key={article.id} article={article} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="p-12 text-center bg-surface rounded-2xl border border-border shadow-card space-y-2">
          <div className="w-12 h-12 rounded-xl bg-brand-muted text-brand flex items-center justify-center mx-auto mb-3">
            <SearchIcon size={24} />
          </div>
          <h3 className="text-base font-bold font-display uppercase text-text-primary">
            Ready to Search
          </h3>
          <p className="text-xs font-mono text-text-tertiary max-w-sm mx-auto">
            Type any startup name, funding round, investor, or policy term above to scan verified reports.
          </p>
        </div>
      )}
    </div>
  );
}
