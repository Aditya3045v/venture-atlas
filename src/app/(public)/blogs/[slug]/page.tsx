import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchBlogBySlug, fetchBlogs } from '@/lib/supabase-db';
import { constructMetadata, generateArticleJsonLd } from '@/lib/seo';
import { formatSimpleMarkdown } from '@/lib/sanitize';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ReadingProgressBar } from '@/components/ui/ReadingProgressBar';
import { ViewTracker } from '@/components/analytics/ViewTracker';
import { ArrowLeft, Clock, BookOpen, ArrowUpRight } from 'lucide-react';
import { format } from 'date-fns';

export const revalidate = 3600; // 1 hour ISR

interface BlogPageProps {
  params: { slug: string };
}

export async function generateStaticParams() {
  const blogs = await fetchBlogs(20);
  return blogs.map(b => ({
    slug: b.slug,
  }));
}

export async function generateMetadata({ params }: BlogPageProps) {
  const blog = await fetchBlogBySlug(params.slug);

  if (!blog) return { title: 'Essay Not Found — Venture Atlas' };

  const publishedIso = blog.publishedAt
    ? new Date(blog.publishedAt).toISOString()
    : new Date(blog.createdAt).toISOString();

  const modifiedIso = blog.updatedAt
    ? new Date(blog.updatedAt).toISOString()
    : publishedIso;

  return constructMetadata({
    title: blog.title,
    description: blog.excerpt,
    canonicalPath: `/blogs/${blog.slug}`,
    image: blog.coverImage || undefined,
    imageAlt: blog.title,
    type: 'article',
    publishedTime: publishedIso,
    modifiedTime: modifiedIso,
    authors: [blog.author?.name || 'Venture Atlas Editorial Board'],
    section: blog.category?.name || 'Essays',
  });
}

export default async function SingleBlogPage({ params }: BlogPageProps) {
  const [blog, allBlogs] = await Promise.all([
    fetchBlogBySlug(params.slug),
    fetchBlogs(10),
  ]);

  if (!blog) {
    notFound();
  }

  const relatedBlogs = allBlogs.filter(b => b.id !== blog.id).slice(0, 3);
  const jsonLd = generateArticleJsonLd(blog, 'blog');

  const authorName = blog.author?.name || 'Venture Atlas Staff';
  const authorSlug = authorName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const formattedDate = blog.publishedAt
    ? format(new Date(blog.publishedAt), 'MMMM d, yyyy')
    : 'Draft';

  return (
    <>
      <ReadingProgressBar />
      <ViewTracker entityId={blog.id} entityType="BLOG" path={`/blogs/${blog.slug}`} />

      {/* Server-rendered Schema.org JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-3xl mx-auto space-y-6">
        {/* Visible Breadcrumbs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border/60 pb-3">
          <Breadcrumbs
            items={[
              { name: 'Blogs & Essays', url: '/blogs' },
              { name: blog.title, url: `/blogs/${blog.slug}` },
            ]}
          />
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-text-secondary hover:text-brand transition-colors shrink-0"
          >
            <ArrowLeft size={13} />
            <span>All Essays</span>
          </Link>
        </div>

        <article className="space-y-6">
          {/* Header */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5 text-xs font-mono">
              <span
                className="px-3 py-1 rounded-md font-bold uppercase text-white shadow-sm"
                style={{ backgroundColor: blog.category?.color || '#2563EB' }}
              >
                {blog.category?.name || 'Essay'}
              </span>
              <span className="text-text-tertiary">·</span>
              <div className="flex items-center gap-1 text-text-secondary">
                <Clock size={12} />
                <span>{blog.readTimeMinutes} min read</span>
              </div>
              <span className="text-text-tertiary">·</span>
              <span className="text-text-tertiary">{formattedDate}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display text-text-primary leading-tight tracking-tight">
              {blog.title}
            </h1>

            <p className="text-lg font-body text-text-secondary leading-relaxed font-normal pt-1">
              {blog.excerpt}
            </p>
          </div>

          {/* Author Byline with Person Link */}
          <Link
            href={`/authors/${authorSlug}`}
            className="p-4 rounded-2xl border border-border bg-surface flex items-center justify-between hover:border-brand/40 transition-colors group"
          >
            <div className="flex items-center gap-3">
              {blog.author?.avatar ? (
                <img
                  src={blog.author.avatar}
                  alt={authorName}
                  className="w-10 h-10 rounded-full object-cover border border-border"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-brand/10 text-brand flex items-center justify-center font-bold text-sm">
                  {authorName.charAt(0)}
                </div>
              )}
              <div>
                <div className="text-sm font-bold text-text-primary font-display group-hover:text-brand transition-colors">
                  {authorName}
                </div>
                <div className="text-xs font-mono text-text-tertiary">
                  {blog.author?.bio || 'Editorial Contributor at Venture Atlas'}
                </div>
              </div>
            </div>
            <span className="text-xs font-mono text-brand flex items-center gap-1">
              <span>Profile</span>
              <ArrowUpRight size={13} />
            </span>
          </Link>

          {/* Cover Photo */}
          {blog.coverImage && (
            <div className="w-full h-64 sm:h-96 rounded-2xl overflow-hidden bg-surface-muted border border-border">
              <img
                src={blog.coverImage}
                alt={blog.title}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {/* Main Body */}
          <div
            className="prose prose-slate dark:prose-invert max-w-none text-text-secondary text-base leading-relaxed space-y-4 pt-4"
            dangerouslySetInnerHTML={{
              __html: formatSimpleMarkdown(blog.body),
            }}
          />
        </article>

        {/* Related Essays */}
        {relatedBlogs.length > 0 && (
          <section className="mt-14 pt-8 border-t border-border space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-purple-500" />
                <h3 className="text-lg font-black font-display text-text-primary uppercase tracking-tight">
                  More Long-Form Essays
                </h3>
              </div>
              <Link
                href="/blogs"
                className="text-xs font-mono font-bold uppercase text-brand hover:underline"
              >
                View all →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {relatedBlogs.map(rb => (
                <Link
                  key={rb.id}
                  href={`/blogs/${rb.slug}`}
                  className="p-4 rounded-2xl bg-surface border border-border hover:border-brand/40 transition-all space-y-2 block group"
                >
                  <span className="text-[10px] font-mono uppercase text-brand font-bold">
                    {rb.category?.name || 'Essay'}
                  </span>
                  <h4 className="font-bold text-sm font-display text-text-primary group-hover:text-brand transition-colors line-clamp-2">
                    {rb.title}
                  </h4>
                  <p className="text-xs text-text-tertiary line-clamp-2">
                    {rb.excerpt}
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

