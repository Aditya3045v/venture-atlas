import React from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { fetchArticles, fetchCaseStudies, fetchBlogs } from '@/lib/supabase-db';
import { StoryCard } from '@/components/news/StoryCard';
import { FeaturedStory } from '@/components/news/FeaturedStory';
import {
  IconBriefcase,
  IconBook2,
  IconArrowNarrowRight,
} from '@tabler/icons-react';

export const revalidate = 0; // Dynamic on demand

export default async function CoreHomePage() {
  const cookieStore = cookies();
  const isUnlocked =
    Boolean(cookieStore.get('va_unlocked_user')?.value) ||
    Boolean(cookieStore.get('va_session_user')?.value);

  // If new visitor without email, redirect to the Landing Page
  if (!isUnlocked) {
    redirect('/landing');
  }

  const [articles, caseStudies, blogs] = await Promise.all([
    fetchArticles({ limit: 12, status: 'PUBLISHED' }),
    fetchCaseStudies(2),
    fetchBlogs(2),
  ]);

  const featuredArticle = articles.find(a => a.isFeatured) || articles[0];
  const feedArticles = articles.filter(a => a.id !== featuredArticle?.id);

  return (
    <div className="space-y-12 select-none pt-2">
      {/* Featured Lead Story */}
      {featuredArticle && <FeaturedStory article={featuredArticle} />}

      {/* Breaking News Briefs Grid (Strictly 60 Words) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-border/80 pb-2">
          <h2 className="text-lg font-black font-display uppercase tracking-tight text-text-primary">
            Latest 60-Word Briefings
          </h2>
          <span className="text-xs font-mono text-text-tertiary">
            Updated Continuously
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {feedArticles.map(article => (
            <StoryCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* Startup Architecture & Case Studies Section */}
      {caseStudies.length > 0 && (
        <section className="pt-10 border-t border-border/80 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBriefcase size={20} className="text-amber-400" />
              <div>
                <h2 className="text-xl font-black font-display text-text-primary uppercase tracking-tight">
                  Startup Architecture & Case Studies
                </h2>
                <p className="text-xs font-mono text-text-tertiary mt-0.5">
                  Deep breakdowns of scaling playbooks, zero-CAC distribution, and unit economics
                </p>
              </div>
            </div>

            <Link
              href="/case-studies"
              className="inline-flex items-center gap-1 text-xs font-bold font-mono uppercase text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>View all teardowns</span>
              <IconArrowNarrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {caseStudies.map((cs, idx) => (
              <Link
                key={cs.id}
                href={`/case-studies/${cs.slug}`}
                className={`ios-card rounded-3xl p-6 sm:p-7 flex flex-col justify-between space-y-4 group transition-all duration-300 hover:scale-[1.01] ${
                  idx % 2 === 0
                    ? 'bg-gradient-to-br from-blue-500/[0.06] via-surface-card to-surface-card dark:from-blue-500/[0.08] dark:via-[#111113] dark:to-[#111113] border-blue-500/20 hover:border-blue-500/40'
                    : 'bg-gradient-to-br from-emerald-500/[0.06] via-surface-card to-surface-card dark:from-emerald-500/[0.08] dark:via-[#111113] dark:to-[#111113] border-emerald-500/20 hover:border-emerald-500/40'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-surface-muted text-text-primary border border-border/70">
                        {cs.company}
                      </span>
                      <span className="text-text-tertiary">·</span>
                      <span className="text-text-tertiary">{cs.stage}</span>
                    </div>
                    <span className="text-text-tertiary">{cs.readTimeMinutes} min read</span>
                  </div>

                  <h3 className="text-lg font-bold font-display text-text-primary group-hover:opacity-90 transition-opacity line-clamp-2">
                    {cs.title}
                  </h3>

                  <p className="text-xs sm:text-sm font-body text-text-secondary line-clamp-2 leading-relaxed">
                    {cs.summary}
                  </p>

                  {cs.keyMetric && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-surface-muted text-text-primary border border-border/60">
                        <IconBriefcase size={13} className="text-emerald-400" />
                        <span>{cs.keyMetric}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono text-text-tertiary">
                  <span>Valuation: <strong className="text-text-primary">{cs.valuation || 'Private'}</strong></span>
                  <span className="text-text-primary dark:text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Explore playbook →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Long-Form Essays Section */}
      {blogs.length > 0 && (
        <section className="pt-10 border-t border-border/80 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <IconBook2 size={20} className="text-amber-400" />
              <div>
                <h2 className="text-xl font-black font-display text-text-primary uppercase tracking-tight">
                  Editorial Essays & Deep Dives
                </h2>
                <p className="text-xs font-mono text-text-tertiary mt-0.5">
                  Macro perspectives, term sheet mechanics, and LP dynamics
                </p>
              </div>
            </div>

            <Link
              href="/blogs"
              className="inline-flex items-center gap-1 text-xs font-bold font-mono uppercase text-amber-400 hover:text-amber-300 transition-colors"
            >
              <span>View all essays</span>
              <IconArrowNarrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {blogs.map((blog, idx) => {
              const cardBgGradients = [
                'bg-gradient-to-br from-amber-500/[0.07] via-surface-card to-surface-card dark:from-amber-500/[0.08] dark:via-[#111113] dark:to-[#111113] border-amber-500/20 hover:border-amber-500/40',
                'bg-gradient-to-br from-indigo-500/[0.07] via-surface-card to-surface-card dark:from-indigo-500/[0.08] dark:via-[#111113] dark:to-[#111113] border-indigo-500/20 hover:border-indigo-500/40',
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
                      <span>{blog.readTimeMinutes} min read</span>
                    </div>

                    <h3 className="text-lg font-bold font-display text-text-primary group-hover:opacity-90 transition-opacity line-clamp-2">
                      {blog.title}
                    </h3>

                    <p className="text-xs sm:text-sm font-body text-text-secondary line-clamp-3 leading-relaxed">
                      {blog.excerpt}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-border/50 flex items-center justify-between text-xs font-mono text-text-tertiary">
                    <span>By {blog.author?.name || 'Venture Atlas Editorial'}</span>
                    <span className="text-text-primary dark:text-amber-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                      Read essay →
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}
