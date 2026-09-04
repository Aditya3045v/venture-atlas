import React from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { generateBreadcrumbJsonLd } from '@/lib/seo';

export interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
  includeJsonLd?: boolean;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, includeJsonLd = true }) => {
  const allItems: BreadcrumbItem[] = [
    { name: 'Home', url: '/' },
    ...items,
  ];

  const jsonLd = generateBreadcrumbJsonLd(allItems);

  return (
    <>
      {includeJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      )}
      <nav aria-label="Breadcrumb" className="py-2 select-none">
        <ol className="flex items-center flex-wrap gap-1.5 text-[11px] font-mono text-text-tertiary">
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            return (
              <li key={item.url} className="flex items-center gap-1.5">
                {index > 0 && (
                  <ChevronRight size={12} className="opacity-40 shrink-0" aria-hidden="true" />
                )}
                {isLast ? (
                  <span className="font-bold text-text-primary truncate max-w-[240px] sm:max-w-md" aria-current="page">
                    {item.name}
                  </span>
                ) : (
                  <Link
                    href={item.url}
                    className="hover:text-text-primary transition-colors flex items-center gap-1 hover:underline"
                  >
                    {index === 0 && <Home size={11} className="shrink-0" />}
                    <span>{item.name}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
};
