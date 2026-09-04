import React from 'react';
import Link from 'next/link';
import { fetchBlogs } from '@/lib/supabase-db';
import { BookOpen, Clock } from 'lucide-react';

import { constructMetadata, generateItemListJsonLd } from '@/lib/seo';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';

export const metadata = constructMetadata({
  title: 'Editorial Essays & Market Perspectives',
  description: 'Comprehensive teardowns on venture capital mechanics, modern founder blueprints, sovereign cloud infrastructure, and market liquidity.',
  canonicalPath: '/blogs',
  section: 'Essays',
});

export const revalidate = 0;

export default async function BlogsPage() {
  const blogs = await fetchBlogs(50);

  const itemListJsonLd = generateItemListJsonLd(
    'Editorial Essays & Perspectives',
    blogs.map(b => ({ name: b.title, url: `/blogs/${b.slug}` }))
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <div className="space-y-8 max-w-5xl mx-auto select-none">
        <Breadcrumbs items={[{ name: 'Blogs & Essays', url: '/blogs' }]} />

        {/* Header */}
        <div className="p-8 sm:p-10 rounded-3xl ios-card space-y-3">
        <div className="flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-text-tertiary">
          <BookOpen size={15} className="text-amber-400" />
          <span>EDITORIAL ESSAYS & ANALYSIS</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display uppercase tracking-tight text-text-primary">
          Deep Dives & Perspectives
        </h1>
        <p className="text-sm md:text-base text-text-secondary font-body max-w-2xl leading-relaxed">
          Comprehensive teardowns on venture capital mechanics, modern founder blueprints, sovereign cloud infrastructure, and market liquidity dynamics.
        </p>
      </div>

      {/* Blog Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {blogs.map((blog, idx) => {
          const cardBgGradients = [
            'bg-gradient-to-br from-amber-500/[0.07] via-surface-card to-surface-card dark:from-amber-500/[0.08] dark:via-[#111113] dark:to-[#111113] border-amber-500/20 hover:border-amber-500/40',
            'bg-gradient-to-br from-indigo-500/[0.07] via-surface-card to-surface-card dark:from-indigo-500/[0.08] dark:via-[#111113] dark:to-[#111113] border-indigo-500/20 hover:border-indigo-500/40',
            'bg-gradient-to-br from-purple-500/[0.07] via-surface-card to-surface-card dark:from-purple-500/[0.08] dark:via-[#111113] dark:to-[#111113] border-purple-500/20 hover:border-purple-500/40',
            'bg-gradient-to-br from-rose-500/[0.07] via-surface-card to-surface-card dark:from-rose-500/[0.08] dark:via-[#111113] dark:to-[#111113] border-rose-500/20 hover:border-rose-500/40',
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
                  <div className="flex items-center gap-1">
                    <Clock size={12} />
                    <span>{blog.readTimeMinutes} min read</span>
                  </div>
                </div>

                <h2 className="text-xl font-bold font-display text-text-primary group-hover:opacity-90 transition-opacity leading-snug line-clamp-2">
                  {blog.title}
                </h2>

                <p className="text-xs sm:text-sm font-body text-text-secondary leading-relaxed line-clamp-3">
                  {blog.excerpt}
                </p>
              </div>

              <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono text-text-tertiary">
                <span>By {blog.author?.name || 'Alex Rivera'}</span>
                <span className="text-text-primary dark:text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                  Read essay →
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  </>
);
}
