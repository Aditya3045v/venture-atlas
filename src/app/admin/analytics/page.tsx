import React from 'react';
import { prisma, ensureDatabaseSeeded } from '../../../lib/db';
import { BarChart3, TrendingUp, Eye, Search, Smartphone, Monitor } from 'lucide-react';

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  await ensureDatabaseSeeded();

  const [articles, categories] = await Promise.all([
    prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      orderBy: { viewCount: 'desc' },
      take: 5,
      include: { category: true },
    }),
    prisma.category.findMany({
      include: {
        _count: { select: { articles: true } },
      },
    }),
  ]);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <div className="border-b border-border pb-4">
        <div className="text-xs font-mono font-bold uppercase text-text-tertiary">
          METRICS & INTELLIGENCE
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display uppercase tracking-tight text-text-primary">
          Readership & Content Analytics
        </h1>
        <p className="text-xs font-mono text-text-tertiary mt-0.5">
          Measure content performance, category volume distribution, and reader attention.
        </p>
      </div>

      {/* Top 5 Most Read Stories */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
          <TrendingUp size={16} className="text-brand" />
          <span>Top Read Briefs & Reports (All-Time)</span>
        </h2>

        <div className="rounded-2xl border border-border bg-surface shadow-card divide-y divide-border overflow-hidden">
          {articles.map((art, idx) => (
            <div key={art.id} className="p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <span className="w-6 h-6 rounded-lg bg-surface-muted border border-border flex items-center justify-center font-mono font-bold text-xs text-text-primary shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <div className="font-bold font-display text-sm text-text-primary truncate">
                    {art.title}
                  </div>
                  <div className="text-[10px] font-mono text-text-tertiary">
                    {art.category?.name} · {art.wordCount} words
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-sm font-black font-mono text-text-primary">
                  {art.viewCount.toLocaleString()}
                </div>
                <div className="text-[9px] font-mono text-text-tertiary uppercase">READS</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category Volume & Platform Distribution */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Category breakdown */}
        <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            Coverage Desk Volume
          </h3>
          <div className="space-y-3">
            {categories.map(cat => (
              <div key={cat.id} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-text-primary">{cat.name}</span>
                  <span className="text-text-tertiary">{cat._count.articles} stories</span>
                </div>
                <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: cat.color,
                      width: `${Math.min(100, (cat._count.articles / 5) * 100)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Device & Client breakdown */}
        <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
          <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
            Reader Platform Breakdown
          </h3>
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-muted border border-border">
              <div className="flex items-center gap-3">
                <Smartphone size={20} className="text-brand" />
                <div>
                  <div className="text-xs font-bold text-text-primary">Mobile Web & PWA</div>
                  <div className="text-[10px] font-mono text-text-tertiary">iOS & Android browsers</div>
                </div>
              </div>
              <span className="text-sm font-black font-mono text-text-primary">68.4%</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-surface-muted border border-border">
              <div className="flex items-center gap-3">
                <Monitor size={20} className="text-emerald-500" />
                <div>
                  <div className="text-xs font-bold text-text-primary">Desktop Editorial</div>
                  <div className="text-[10px] font-mono text-text-tertiary">macOS & Windows workstations</div>
                </div>
              </div>
              <span className="text-sm font-black font-mono text-text-primary">31.6%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
