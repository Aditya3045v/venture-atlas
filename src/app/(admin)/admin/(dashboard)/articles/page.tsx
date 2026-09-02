'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, Trash2, Edit3, CheckCircle2, XCircle, ArrowUpRight, Eye } from 'lucide-react';
import { ArticleItem, ContentStatus } from '@/types';
import { useToast } from '@/components/providers/ToastProvider';
import { formatDistanceToNow } from 'date-fns';

const STATUS_TABS = ['ALL', 'PUBLISHED', 'SCHEDULED', 'IN_REVIEW', 'DRAFT', 'ARCHIVED'];

export default function AdminArticlesPage() {
  const { toast } = useToast();
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  const fetchArticles = async () => {
    try {
      const res = await fetch('/api/articles?all=true');
      const data = await res.json();
      setArticles(data.articles || []);
    } catch {
      toast('Failed to load articles', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  const handleTogglePublish = async (article: ArticleItem) => {
    const nextStatus: ContentStatus = article.status === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
    try {
      const res = await fetch(`/api/articles/${article.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });

      if (res.ok) {
        toast(`Article status changed to ${nextStatus}`, 'success');
        setArticles(prev =>
          prev.map(a => (a.id === article.id ? { ...a, status: nextStatus } : a))
        );
      } else {
        toast('Failed to update status', 'error');
      }
    } catch {
      toast('Error updating status', 'error');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this story?')) return;

    try {
      const res = await fetch(`/api/articles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        toast('Article deleted successfully', 'success');
        setArticles(prev => prev.filter(a => a.id !== id));
      } else {
        toast('Failed to delete article', 'error');
      }
    } catch {
      toast('Error deleting article', 'error');
    }
  };

  const filtered = articles.filter(a => {
    const matchesStatus = statusFilter === 'ALL' || a.status === statusFilter;
    const matchesSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.author?.name?.toLowerCase().includes(search.toLowerCase()) ||
      a.sourceName?.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
            CONTENT REPOSITORY
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
            News Briefs & Stories
          </h1>
          <p className="text-xs font-mono text-text-tertiary mt-0.5">
            Manage lifecycle states, editorial review queues, and publishing schedules.
          </p>
        </div>

        <Link
          href="/admin/articles/new"
          className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-brand-strong transition-colors shadow-sm self-start sm:self-auto"
        >
          <Plus size={15} />
          <span>+ Create Short</span>
        </Link>
      </div>

      {/* Controls: Search & Status Filters */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search headlines, authors, sources..."
            className="w-full h-10 pl-9 pr-4 text-xs font-medium border border-border rounded-xl bg-surface text-text-primary focus:outline-none focus:ring-2 focus:ring-brand"
          />
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        </div>

        {/* Status Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar bg-surface p-1 rounded-xl border border-border">
          {STATUS_TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold uppercase whitespace-nowrap transition-colors ${
                statusFilter === tab
                  ? 'bg-brand text-white'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-muted'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Data Table */}
      <div className="rounded-2xl border border-border bg-surface shadow-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[700px]">
            <thead>
              <tr className="border-b border-border bg-surface-muted text-[11px] font-mono font-bold uppercase text-text-tertiary">
                <th className="p-4 w-5/12">HEADLINE & METRICS</th>
                <th className="p-4 text-center">CATEGORY</th>
                <th className="p-4">AUTHOR</th>
                <th className="p-4 text-center">STATUS</th>
                <th className="p-4 text-right">READS</th>
                <th className="p-4 text-right">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs font-mono text-text-tertiary">
                    Loading content repository...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-xs font-mono text-text-tertiary">
                    No articles found matching active filters.
                  </td>
                </tr>
              ) : (
                filtered.map(article => {
                  const isPub = article.status === 'PUBLISHED';
                  return (
                    <tr key={article.id} className="hover:bg-surface-muted/50 transition-colors">
                      {/* Headline */}
                      <td className="p-4">
                        <Link
                          href={`/admin/articles/${article.id}/edit`}
                          className="font-display font-bold text-sm text-text-primary hover:text-brand transition-colors line-clamp-2"
                        >
                          {article.title}
                        </Link>
                        <div className="text-[10px] font-mono text-text-tertiary mt-1">
                          {article.wordCount} words · {article.sourceName || 'Wire'} ·{' '}
                          {article.publishedAt
                            ? formatDistanceToNow(new Date(article.publishedAt), { addSuffix: true })
                            : 'Draft'}
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-center">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase text-white inline-block"
                          style={{ backgroundColor: article.category?.color || '#2563EB' }}
                        >
                          {article.category?.name}
                        </span>
                      </td>

                      {/* Author */}
                      <td className="p-4 text-xs font-mono text-text-secondary">
                        {article.author?.name || 'Editorial Staff'}
                      </td>

                      {/* Status */}
                      <td className="p-4 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase inline-block ${
                            article.status === 'PUBLISHED'
                              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                              : article.status === 'IN_REVIEW'
                              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                              : article.status === 'SCHEDULED'
                              ? 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                          }`}
                        >
                          {article.status}
                        </span>
                      </td>

                      {/* Reads */}
                      <td className="p-4 text-right font-mono text-xs font-bold text-text-primary">
                        {article.viewCount ? article.viewCount.toLocaleString() : '—'}
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/articles/${article.id}/edit`}
                            className="p-1.5 rounded-lg border border-border text-text-secondary hover:text-text-primary hover:bg-surface-muted transition-colors"
                            title="Edit story"
                          >
                            <Edit3 size={14} />
                          </Link>

                          <button
                            onClick={() => handleTogglePublish(article)}
                            className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase transition-colors ${
                              isPub
                                ? 'bg-red-50 text-red-700 hover:bg-red-100 dark:bg-red-950/40 dark:text-red-300'
                                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300'
                            }`}
                          >
                            {isPub ? 'Unpublish' : 'Publish'}
                          </button>

                          <button
                            onClick={() => handleDelete(article.id)}
                            className="p-1.5 rounded-lg text-text-tertiary hover:text-red-600 transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
