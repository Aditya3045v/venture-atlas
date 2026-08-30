import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { BlogItem } from '@/types';
import { constructMetadata } from '@/lib/seo';
import { formatSimpleMarkdown } from '@/lib/sanitize';
import { ArrowLeft, Clock, BookOpen, Share2 } from 'lucide-react';
import { format } from 'date-fns';

export const revalidate = 0;

interface BlogPageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: BlogPageProps) {
  await ensureDatabaseSeeded();
  const blog = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
  });

  if (!blog) return { title: 'Essay Not Found' };

  return constructMetadata({
    title: blog.title,
    description: blog.excerpt,
    image: blog.coverImage,
    url: `https://ventureatlas.io/blogs/${blog.slug}`,
  });
}

export default async function SingleBlogPage({ params }: BlogPageProps) {
  await ensureDatabaseSeeded();

  const blog = await prisma.blogPost.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      author: true,
    },
  });

  if (!blog) {
    notFound();
  }

  const formattedDate = blog.publishedAt
    ? format(new Date(blog.publishedAt), 'MMMM d, yyyy')
    : 'Draft';

  return (
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
              {blog.category?.name}
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
          <div className="w-full rounded-2xl overflow-hidden border border-border bg-surface-muted max-h-[460px]">
            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        {/* Body Content */}
        <div className="p-6 sm:p-10 bg-surface rounded-2xl border border-border shadow-card">
          <div
            className="editorial-prose text-base font-body text-text-primary"
            dangerouslySetInnerHTML={{ __html: formatSimpleMarkdown(blog.body) }}
          />
        </div>
      </article>
    </div>
  );
}
