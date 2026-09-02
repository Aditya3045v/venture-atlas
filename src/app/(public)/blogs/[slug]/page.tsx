import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { fetchBlogBySlug, fetchBlogs } from '@/lib/supabase-db';
import { constructMetadata } from '@/lib/seo';
import { formatSimpleMarkdown } from '@/lib/sanitize';
import { ReadingProgressBar } from '@/components/ui/ReadingProgressBar';
import { ViewTracker } from '@/components/analytics/ViewTracker';
import { ArrowLeft, Clock } from 'lucide-react';
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

  if (!blog) return { title: 'Essay Not Found' };

  return constructMetadata({
    title: blog.title,
    description: blog.excerpt,
    image: blog.coverImage || undefined,
    url: `https://ventureatlas.io/blogs/${blog.slug}`,
  });
}

export default async function SingleBlogPage({ params }: BlogPageProps) {
  const blog = await fetchBlogBySlug(params.slug);

  if (!blog) {
    notFound();
  }

  const formattedDate = blog.publishedAt
    ? format(new Date(blog.publishedAt), 'MMMM d, yyyy')
    : 'Draft';

  return (
    <>
      <ReadingProgressBar />
      <ViewTracker entityId={blog.id} entityType="BLOG" path={`/blogs/${blog.slug}`} />

      <div className="max-w-3xl mx-auto space-y-8">
        {/* Back Link */}
        <div>
          <Link
            href="/blogs"
            className="inline-flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-text-secondary hover:text-brand transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to All Essays</span>
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

          {/* Author Byline */}
          <div className="p-4 rounded-xl border border-border bg-surface flex items-center gap-3">
            {blog.author?.avatar && (
              <img
                src={blog.author.avatar}
                alt={blog.author.name}
                className="w-10 h-10 rounded-full object-cover border border-border"
              />
            )}
            <div>
              <div className="text-sm font-bold text-text-primary font-display">
                {blog.author?.name || 'Venture Atlas Staff'}
              </div>
              <div className="text-xs font-mono text-text-tertiary">
                {blog.author?.bio || 'Editorial Contributor'}
              </div>
            </div>
          </div>

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
      </div>
    </>
  );
}
