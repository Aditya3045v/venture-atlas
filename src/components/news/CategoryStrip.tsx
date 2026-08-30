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
      <div className="flex items-center gap-1.5 p-1.5 bg-surface-muted/70 dark:bg-black/60 rounded-full border border-border/60 backdrop-blur-md w-max">
        <Link
          href="/"
          className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight whitespace-nowrap transition-all duration-200 active:scale-95 ${
            activeSlug === 'all'
              ? 'bg-surface text-text-primary font-black shadow-xs border border-border/80 dark:bg-amber-400 dark:text-black dark:border-amber-400 dark:shadow-[0_0_15px_rgba(250,204,21,0.3)]'
              : 'text-text-secondary hover:text-text-primary dark:hover:text-amber-300 hover:bg-surface/50'
          }`}
        >
          All Desks
        </Link>

        {categories.map(cat => {
          const isActive = activeSlug === cat.slug;
          return (
            <Link
              key={cat.slug}
              href={`/categories/${cat.slug}`}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold tracking-tight whitespace-nowrap transition-all duration-200 active:scale-95 ${
                isActive
                  ? 'bg-surface text-text-primary font-black shadow-xs border border-border/80 dark:bg-amber-400 dark:text-black dark:border-amber-400 dark:shadow-[0_0_15px_rgba(250,204,21,0.3)]'
                  : 'text-text-secondary hover:text-text-primary dark:hover:text-amber-300 hover:bg-surface/50'
              }`}
            >
              {cat.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
};
