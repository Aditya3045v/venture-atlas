import React from 'react';
import Link from 'next/link';
import { prisma, ensureDatabaseSeeded } from '../../../lib/db';
import { BlogItem } from '../../../types';
import { Plus, Edit3, Trash2, BookOpen, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const revalidate = 0;

export default async function AdminBlogsPage() {
  await ensureDatabaseSeeded();

  const blogs = await prisma.blogPost.findMany({
    include: {
      category: true,
      author: true,
    },
    orderBy: { updatedAt: 'desc' },
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
            EDITORIAL ESSAYS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
            Long-Form Articles & Deep Dives
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-0.5">
            Manage long-form editorial essays, term sheet breakdowns, and industry reports.
          </p>
        </div>

        <Link
          href="/admin/blogs/new"
          className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-brand-strong transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>+ New Essay</span>
        </Link>
      </div>

      {/* Blogs Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-[11px] font-mono font-bold uppercase text-text-tertiary">
                <th className="p-4 w-6/12">TITLE & EXCERPT</th>
                <th className="p-4 text-center">CATEGORY</th>
                <th className="p-4">AUTHOR</th>
                <th className="p-4 text-center">STATUS</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {blogs.map(blog => (
                <tr key={blog.id} className="hover:bg-surface-muted/50 transition-colors">
                  <td className="p-4">
                    <Link
                      href={`/admin/blogs/${blog.id}/edit`}
                      className="font-display font-bold text-sm text-text-primary hover:text-brand transition-colors line-clamp-1"
                    >
                      {blog.title}
                    </Link>
                    <p className="text-xs font-body text-text-secondary line-clamp-1 mt-1">
                      {blog.excerpt}
                    </p>
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase text-white inline-block"
                      style={{ backgroundColor: blog.category?.color || '#2563EB' }}
                    >
                      {blog.category?.name}
                    </span>
                  </td>

                  <td className="p-4 text-xs font-mono text-text-secondary">
                    {blog.author?.name || 'Editorial Staff'}
                  </td>

                  <td className="p-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-block ${
                        blog.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {blog.status}
                    </span>
                  </td>

                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link
                        href={`/admin/blogs/${blog.id}/edit`}
                        className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
                        title="Edit essay"
                      >
                        <Edit3 size={14} />
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
