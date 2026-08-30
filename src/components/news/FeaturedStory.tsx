import React from 'react';
import Link from 'next/link';
import { ArrowRight, Clock } from 'lucide-react';
import { IconBolt } from '@tabler/icons-react';
import { ArticleItem } from '../../types';
import { formatDistanceToNow } from 'date-fns';

export const FeaturedStory: React.FC<{ article: ArticleItem }> = ({ article }) => {
  const timeAgo = article.publishedAt
    ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
    : 'Recently';

  return (
    <div className="relative w-full rounded-3xl ios-card overflow-hidden group mb-8 select-none">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
        {/* Cover Photo (7 cols on lg) */}
        <div className="lg:col-span-7 relative h-64 sm:h-80 lg:h-full min-h-[320px] bg-surface-muted overflow-hidden">
          {article.coverImage && (
            <img
              src={article.coverImage}
              alt={article.title}
              className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-700 ease-out"
            />
          )}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/80 backdrop-blur-md text-white border border-white/10 shadow-xs flex items-center gap-1.5">
              <IconBolt size={12} className="text-amber-400" />
              <span>LEAD STORY</span>
            </span>
            <span className="px-3 py-1 rounded-full text-[10px] font-mono font-bold uppercase tracking-wider bg-black/70 backdrop-blur-md text-white/90 border border-white/10 shadow-xs">
              {article.category?.name}
            </span>
          </div>
        </div>

        {/* Story Text (5 cols on lg) */}
        <div className="lg:col-span-5 p-6 sm:p-8 flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
              <span className="font-bold text-text-secondary uppercase">
                {article.sourceName || 'Wire Report'}
              </span>
              <span>·</span>
              <div className="flex items-center gap-1">
                <Clock size={12} />
                <span>{timeAgo}</span>
              </div>
            </div>

            <Link href={`/articles/${article.slug}`}>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-black font-display text-text-primary leading-tight tracking-tight group-hover:opacity-90 transition-opacity">
                {article.title}
              </h1>
            </Link>

            <p className="text-sm md:text-base font-body text-text-secondary leading-relaxed font-normal">
              {article.summary}
            </p>
          </div>

          <div className="pt-4 border-t border-border/50 flex items-center justify-between">
            <div className="text-xs font-mono text-text-tertiary">
              {article.readTimeMinutes} min read · {article.wordCount} words
            </div>

            <Link
              href={`/articles/${article.slug}`}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-text-primary text-background text-xs font-bold font-mono uppercase tracking-wider hover:opacity-90 transition-opacity active:scale-95 shadow-xs"
            >
              <span>Read analysis</span>
              <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
