import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchArticles, fetchBlogs, fetchCaseStudies } from '@/lib/supabase-db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { constructMetadata, generateAuthorJsonLd } from '@/lib/seo';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { StoryCard } from '@/components/news/StoryCard';
import { UserCircle, Shield, FileText, BookOpen, Briefcase, Mail } from 'lucide-react';
import { ArticleItem } from '@/types';

export const revalidate = 3600;

interface AuthorPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const { data: profiles } = await supabaseAdmin
    .from('profiles')
    .select('name');

  const authors = (profiles || []).map(p => ({
    slug: (p.name || 'aditya-poddar').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  }));

  if (!authors.some(a => a.slug === 'aditya-poddar')) {
    authors.push({ slug: 'aditya-poddar' });
  }

  return authors;
}

export async function generateMetadata({ params }: AuthorPageProps) {
  const authorName = params.slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  return constructMetadata({
    title: `${authorName}`,
    description: `Read exclusive venture capital dispatches, startup teardowns, and essays by ${authorName} on Venture Atlas.`,
    canonicalPath: `/authors/${params.slug}`,
    section: 'Editorial Team',
  });
}

export default async function AuthorProfilePage({ params }: AuthorPageProps) {
  const authorName = params.slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('*')
    .ilike('name', `%${authorName}%`)
    .maybeSingle();

  const [allArticles, allBlogs, allCaseStudies] = await Promise.all([
    fetchArticles({ limit: 50, status: 'PUBLISHED' }),
    fetchBlogs(20),
    fetchCaseStudies(20),
  ]);

  const authorArticles = allArticles.filter(
    a => (a.sourceAuthor && a.sourceAuthor.toLowerCase().includes(authorName.toLowerCase())) ||
         (a.author?.name && a.author.name.toLowerCase().includes(authorName.toLowerCase()))
  );

  const authorBlogs = allBlogs.filter(
    b => (b.author?.name && b.author.name.toLowerCase().includes(authorName.toLowerCase()))
  );

  const authorCaseStudies = allCaseStudies.filter(
    cs => (cs.author?.name && cs.author.name.toLowerCase().includes(authorName.toLowerCase()))
  );

  const effectiveBio = profile?.bio || `${authorName} is an editorial contributor and senior venture reporter at Venture Atlas covering early-stage venture funding, AI breakthroughs, and corporate governance.`;
  const effectiveRole = profile?.role === 'ADMIN' ? 'Senior Venture Editor & Root Administrator' : profile?.role || 'Senior Venture Reporter';

  const jsonLd = generateAuthorJsonLd({
    name: profile?.name || authorName,
    jobTitle: effectiveRole,
    bio: effectiveBio,
    avatar: profile?.avatar || undefined,
    slug: params.slug,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto space-y-8 select-none py-2">
        <Breadcrumbs
          items={[
            { name: 'Editorial Team', url: '/about' },
            { name: profile?.name || authorName, url: `/authors/${params.slug}` },
          ]}
        />

        {/* Author Bio Header Card */}
        <div className="p-8 sm:p-10 rounded-3xl border border-border bg-surface shadow-card space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              {profile?.avatar ? (
                <img
                  src={profile.avatar}
                  alt={profile.name || authorName}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl object-cover border border-border shadow-inner"
                />
              ) : (
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-brand/10 border border-brand/20 text-brand flex items-center justify-center font-black text-3xl font-display">
                  {authorName.charAt(0)}
                </div>
              )}
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-brand">
                    VERIFIED JOURNALIST BYLINE
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-mono uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Active
                  </span>
                </div>
                <h1 className="text-2xl sm:text-4xl font-black font-display text-text-primary tracking-tight">
                  {profile?.name || authorName}
                </h1>
                <p className="text-xs font-mono text-text-tertiary">
                  {effectiveRole}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col gap-2 shrink-0">
              <div className="p-3 rounded-2xl bg-surface-muted border border-border text-center">
                <div className="text-lg font-black font-display text-text-primary">
                  {authorArticles.length + authorBlogs.length + authorCaseStudies.length}
                </div>
                <div className="text-[9px] font-mono text-text-tertiary uppercase">
                  Published Works
                </div>
              </div>
            </div>
          </div>

          <p className="text-xs sm:text-sm font-body text-text-secondary leading-relaxed border-t border-border/60 pt-4">
            {effectiveBio}
          </p>
        </div>

        {/* Authored 60-Word Briefs */}
        {authorArticles.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-brand" />
                <h2 className="text-base font-black font-display uppercase tracking-tight text-text-primary">
                  Executive Briefs ({authorArticles.length})
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {(authorArticles as unknown as ArticleItem[]).map(article => (
                <StoryCard key={article.id} article={article} />
              ))}
            </div>
          </section>
        )}

        {/* Authored Long-form Essays */}
        {authorBlogs.length > 0 && (
          <section className="space-y-4">
            <div className="flex items-center justify-between border-b border-border/80 pb-2">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-purple-500" />
                <h2 className="text-base font-black font-display uppercase tracking-tight text-text-primary">
                  Long-Form Essays ({authorBlogs.length})
                </h2>
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {authorBlogs.map(blog => (
                <Link
                  key={blog.id}
                  href={`/blogs/${blog.slug}`}
                  className="p-5 rounded-2xl bg-surface border border-border hover:border-purple-500/40 transition-all shadow-xs block group space-y-2"
                >
                  <span className="text-[10px] font-mono uppercase text-purple-600 font-bold">
                    {blog.category?.name || 'Essay'}
                  </span>
                  <h4 className="font-bold text-sm sm:text-base font-display text-text-primary group-hover:text-purple-600 transition-colors line-clamp-2">
                    {blog.title}
                  </h4>
                  <p className="text-xs text-text-tertiary line-clamp-2">
                    {blog.excerpt}
                  </p>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
