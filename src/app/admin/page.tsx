import React from 'react';
import Link from 'next/link';
import { prisma, ensureDatabaseSeeded } from '../../lib/db';
import { ArticleItem, AuditLogItem } from '../../types';
import {
  FileText,
  Clock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Plus,
  ArrowRight,
  Eye,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const revalidate = 0;

export default async function AdminDashboardPage() {
  await ensureDatabaseSeeded();

  const [
    totalPublished,
    totalDrafts,
    totalInReview,
    totalScheduled,
    articles,
    auditLogs,
    totalViews,
  ] = await Promise.all([
    prisma.article.count({ where: { status: 'PUBLISHED' } }),
    prisma.article.count({ where: { status: 'DRAFT' } }),
    prisma.article.count({ where: { status: 'IN_REVIEW' } }),
    prisma.article.count({ where: { status: 'SCHEDULED' } }),
    prisma.article.findMany({
      take: 6,
      orderBy: { updatedAt: 'desc' },
      include: { category: true, author: true },
    }),
    prisma.auditLog.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
    }),
    prisma.article.aggregate({
      _sum: { viewCount: true },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Top Welcome & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-border pb-4">
        <div>
          <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
            EDITORIAL COMMAND CENTER
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
            Overview & Content Health
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/articles/new"
            className="px-4 py-2 rounded-xl bg-brand text-white text-xs font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 hover:bg-brand-strong transition-colors shadow-sm"
          >
            <Plus size={14} />
            <span>+ Create Short Brief</span>
          </Link>
          <Link
            href="/admin/blogs/new"
            className="px-4 py-2 rounded-xl bg-surface border border-border text-text-primary text-xs font-mono font-bold uppercase tracking-wider hover:bg-surface-muted transition-colors shadow-sm"
          >
            <span>+ New Essay</span>
          </Link>
        </div>
      </div>

      {/* 4 Metric KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-text-tertiary">
            <span>PUBLISHED</span>
            <CheckCircle2 size={16} className="text-emerald-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-text-primary">
            {totalPublished}
          </div>
          <div className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
            Active on public feed
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-text-tertiary">
            <span>IN REVIEW</span>
            <AlertCircle size={16} className="text-amber-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-text-primary">
            {totalInReview}
          </div>
          <div className="text-[10px] font-mono text-amber-600 dark:text-amber-400">
            Awaiting editor signoff
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-text-tertiary">
            <span>DRAFTS & QUEUE</span>
            <Clock size={16} className="text-blue-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-text-primary">
            {totalDrafts + totalScheduled}
          </div>
          <div className="text-[10px] font-mono text-blue-600 dark:text-blue-400">
            {totalScheduled} scheduled release
          </div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface shadow-card space-y-1">
          <div className="flex items-center justify-between text-xs font-mono text-text-tertiary">
            <span>TOTAL READS</span>
            <Eye size={16} className="text-purple-500" />
          </div>
          <div className="text-2xl sm:text-3xl font-black font-display text-text-primary">
            {(totalViews._sum.viewCount || 0).toLocaleString()}
          </div>
          <div className="text-[10px] font-mono text-purple-600 dark:text-purple-400">
            Cumulative verified views
          </div>
        </div>
      </div>

      {/* 2-Column Section: Recent Stories & Audit Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Recent Articles (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-text-primary">
              Recent Content Updates
            </h2>
            <Link
              href="/admin/articles"
              className="text-xs font-mono font-bold uppercase text-brand hover:underline"
            >
              View all →
            </Link>
          </div>

          <div className="rounded-2xl border border-border bg-surface shadow-card divide-y divide-border overflow-hidden">
            {(articles as unknown as ArticleItem[]).map(article => (
              <div
                key={article.id}
                className="p-4 flex items-center justify-between gap-4 hover:bg-surface-muted transition-colors"
              >
                <div className="min-w-0 space-y-1">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span
                      className="px-2 py-0.2 rounded text-[9px] font-bold uppercase text-white"
                      style={{ backgroundColor: article.category?.color || '#2563EB' }}
                    >
                      {article.category?.name}
                    </span>
                    <span className="text-text-tertiary">·</span>
                    <span
                      className={`text-[9px] font-bold uppercase px-1.5 py-0.2 rounded ${
                        article.status === 'PUBLISHED'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : article.status === 'IN_REVIEW'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300'
                      }`}
                    >
                      {article.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold font-display text-text-primary truncate">
                    {article.title}
                  </h3>
                </div>

                <Link
                  href={`/admin/articles/${article.id}/edit`}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-mono font-bold uppercase text-text-secondary hover:text-text-primary hover:bg-surface transition-colors shrink-0"
                >
                  Edit
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Log Stream (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-text-primary">
              Security & Audit Stream
            </h2>
            <Link
              href="/admin/audit"
              className="text-xs font-mono font-bold uppercase text-brand hover:underline"
            >
              Full log →
            </Link>
          </div>

          <div className="p-4 rounded-2xl border border-border bg-surface shadow-card space-y-3">
            {(auditLogs as unknown as AuditLogItem[]).map(log => (
              <div key={log.id} className="text-xs font-mono space-y-1 pb-3 border-b border-border last:border-0 last:pb-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-text-primary">{log.action}</span>
                  <span className="text-[10px] text-text-tertiary">
                    {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="text-[11px] text-text-secondary truncate">
                  Actor: <span className="text-text-primary font-medium">{log.actorEmail || 'System'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
