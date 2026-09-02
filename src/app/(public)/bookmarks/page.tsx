import React from 'react';
import { fetchArticles } from '@/lib/supabase-db';
import { StoryCard } from '@/components/news/StoryCard';
import { ArticleItem } from '@/types';
import { Bookmark } from 'lucide-react';

export const revalidate = 0;

export default async function BookmarksPage() {
  const articles = await fetchArticles({ limit: 6 });

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-2xl border border-border bg-surface shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-brand">
            <Bookmark size={16} />
            <span>OFFLINE & SAVED LIBRARY</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
            Saved Story Briefs
          </h1>
          <p className="text-xs font-mono text-text-tertiary">
            Personalized collection of bookmarked stories and executive briefs for rapid reference.
          </p>
        </div>

        <div className="px-4 py-2 rounded-xl bg-surface-muted border border-border text-center self-start sm:self-auto">
          <div className="text-xl font-black font-display text-text-primary leading-none">
            {articles.length}
          </div>
          <div className="text-[10px] font-mono font-bold text-text-tertiary uppercase mt-1">
            SAVED BRIEFS
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {articles.map(article => (
          <StoryCard key={article.id} article={{ ...article, isSaved: true }} />
        ))}
      </div>
    </div>
  );
}
