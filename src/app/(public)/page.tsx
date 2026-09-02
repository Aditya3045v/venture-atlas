import React from 'react';
import Link from 'next/link';
import { fetchArticles, fetchCaseStudies, fetchBlogs, fetchCategories } from '@/lib/supabase-db';
import { FeaturedStory } from '@/components/news/FeaturedStory';
import { FeedStream } from '@/components/news/FeedStream';
import { HomeMobileView } from '@/components/home/HomeMobileView';
import { WelcomeOverlay } from '@/components/home/WelcomeOverlay';
import {
  IconBriefcase,
  IconBook2,
  IconArrowNarrowRight,
} from '@tabler/icons-react';

export const revalidate = 60; // 60-second ISR for live news stream

export default async function CoreHomePage() {
  const [articles, caseStudies, blogs, categories] = await Promise.all([
    fetchArticles({ limit: 16, status: 'PUBLISHED' }),
    fetchCaseStudies(3),
    fetchBlogs(3),
    fetchCategories(),
  ]);

  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];
  const feedArticles = articles.filter(a => a.id !== featuredArticle?.id);

  return (
    <div className="select-none">
      {/* Short skippable welcome sequence for new readers */}
      <WelcomeOverlay />

      {/* 1. Mobile & Tablet Dedicated View */}
      <div className="block lg:hidden">
        <HomeMobileView
          articles={articles}
          caseStudies={caseStudies}
          blogs={blogs}
          categories={categories}
        />
      </div>

      {/* 2. Desktop High-Density View */}
      <div className="hidden lg:block space-y-12 pt-2">
        {/* Featured Lead Story */}
        {featuredArticle && <FeaturedStory article={featuredArticle} />}

        {/* Breaking News Briefs Stream (Infinite Scroll + Cursor Pagination) */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b border-border/80 pb-2">
            <h2 className="text-lg font-black font-display uppercase tracking-tight text-text-primary">
              Latest 60-Word Briefings
            </h2>
            <span className="text-xs font-mono font-medium text-emerald-500 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              LIVE DISPATCH
            </span>
          </div>

          <FeedStream initialArticles={feedArticles} categories={categories} />
        </section>

        {/* Deep Dive Teardowns Section */}
        {caseStudies.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <div className="flex items-center gap-2">
                <IconBriefcase size={18} className="text-amber-500" />
                <h2 className="text-lg font-black font-display uppercase tracking-tight text-text-primary">
                  Startup Architecture & Case Studies
                </h2>
              </div>
              <Link
                href="/case-studies"
                className="text-xs font-mono font-bold text-text-tertiary hover:text-text-primary flex items-center gap-1 transition-colors"
              >
                <span>All Teardowns</span>
                <IconArrowNarrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {caseStudies.map(cs => (
                <Link
                  key={cs.id}
                  href={`/case-studies/${cs.slug}`}
                  className="ios-card p-5 rounded-2xl flex flex-col justify-between group hover:border-amber-400/50 transition-colors"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs font-mono text-text-tertiary">
                      <span className="font-bold text-text-primary uppercase">{cs.company}</span>
                      <span>{cs.stage || 'Scale'}</span>
                    </div>
                    <h3 className="font-bold font-display text-text-primary group-hover:text-amber-500 transition-colors line-clamp-2">
                      {cs.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                      {cs.summary}
                    </p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-border/60 flex items-center justify-between text-xs font-mono">
                    <span className="text-text-tertiary">Valuation: <strong className="text-text-primary">{cs.valuation || 'Private'}</strong></span>
                    <span className="text-amber-500 font-bold group-hover:translate-x-0.5 transition-transform">Playbook →</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Executive Blog Essays Section */}
        {blogs.length > 0 && (
          <section className="space-y-4 pt-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <div className="flex items-center gap-2">
                <IconBook2 size={18} className="text-blue-500" />
                <h2 className="text-lg font-black font-display uppercase tracking-tight text-text-primary">
                  Long-Form Essays & Analysis
                </h2>
              </div>
              <Link
                href="/blogs"
                className="text-xs font-mono font-bold text-text-tertiary hover:text-text-primary flex items-center gap-1 transition-colors"
              >
                <span>All Essays</span>
                <IconArrowNarrowRight size={14} />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {blogs.map(blog => (
                <Link
                  key={blog.id}
                  href={`/blogs/${blog.slug}`}
                  className="ios-card p-6 rounded-2xl flex flex-col justify-between group hover:border-blue-500/50 transition-colors"
                >
                  <div className="space-y-2.5">
                    <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
                      <span className="px-2 py-0.5 rounded-full bg-surface-muted text-text-primary font-bold uppercase text-[10px]">
                        {blog.category?.name || 'Venture'}
                      </span>
                      <span>·</span>
                      <span>{blog.readTimeMinutes} min read</span>
                    </div>
                    <h3 className="text-base font-bold font-display text-text-primary group-hover:text-blue-500 transition-colors line-clamp-2">
                      {blog.title}
                    </h3>
                    <p className="text-xs text-text-secondary line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
