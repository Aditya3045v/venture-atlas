'use client';

import React from 'react';
import Link from 'next/link';
import { CategoryItem } from '../../types';

interface CategoryStripProps {
  categories: CategoryItem[];
  activeSlug?: string;
}

export const CategoryStrip: React.FC<CategoryStripProps> = ({ categories, activeSlug = 'all' }) => {
  return (
    <div className="w-full overflow-x-auto no-scrollbar py-2 my-2 select-none">
      <div className="flex items-center gap-2 p-1.5 bg-surface-muted/80 dark:bg-black/60 rounded-2xl border border-border/70 backdrop-blur-md w-max">
        <Link
          href="/"
          className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight whitespace-nowrap transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${
            activeSlug === 'all'
              ? 'bg-amber-400 text-black font-black shadow-md border border-amber-400'
              : 'bg-surface/80 dark:bg-neutral-900/60 text-text-secondary hover:text-text-primary border border-border/50'
          }`}
        >
          <span>🔥 All Desks</span>
        </Link>

        {categories.map(cat => {
          const isActive = activeSlug === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className={`px-4 py-2 rounded-xl text-xs font-bold tracking-tight whitespace-nowrap transition-all duration-200 active:scale-95 flex items-center gap-1.5 ${
                isActive
                  ? 'bg-amber-400 text-black font-black shadow-md border border-amber-400'
                  : 'bg-surface/80 dark:bg-neutral-900/60 text-text-secondary hover:text-text-primary border border-border/50'
              }`}
            >
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: cat.color || '#3B82F6' }}
              />
              <span>{cat.name}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
};
