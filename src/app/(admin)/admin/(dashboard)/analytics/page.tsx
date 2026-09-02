import React from 'react';
import { fetchAdminAnalytics } from '@/lib/supabase-db';
import { ArticleItem } from '@/types';
import { TrendingUp, Smartphone, Monitor, Globe, Users, Eye } from 'lucide-react';

export const revalidate = 0;

export default async function AdminAnalyticsPage() {
  const {
    topArticles,
    categoryStats,
    totalViews,
    deviceBreakdown,
    topReferrers,
    subscriberCount,
  } = await fetchAdminAnalytics();

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
          Real-time metrics sourced from PostgreSQL database view events and subscription records.
        </p>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl border border-border bg-surface shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-brand/10 text-brand">
            <Eye size={22} />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-text-tertiary">Recorded Page Views</div>
            <div className="text-2xl font-black font-mono text-text-primary">{totalViews.toLocaleString()}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <Users size={22} />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-text-tertiary">Newsletter Subscribers</div>
            <div className="text-2xl font-black font-mono text-text-primary">{subscriberCount.toLocaleString()}</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl border border-border bg-surface shadow-card flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-500">
            <Globe size={22} />
          </div>
          <div>
            <div className="text-xs font-mono uppercase text-text-tertiary">Top Traffic Channels</div>
            <div className="text-2xl font-black font-mono text-text-primary">{topReferrers.length}</div>
          </div>
        </div>
      </div>

      {/* Top 5 Most Read Stories */}
      <div className="space-y-4">
        <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-text-primary flex items-center gap-2">
          <TrendingUp size={16} className="text-brand" />
          <span>Top Read Briefs & Reports (All-Time)</span>
        </h2>

        <div className="rounded-2xl border border-border bg-surface shadow-card divide-y divide-border overflow-hidden">
          {topArticles.length === 0 ? (
            <div className="p-8 text-center text-xs font-mono text-text-tertiary">
              No published stories recorded yet.
            </div>
          ) : (
            topArticles.map((art: ArticleItem, idx: number) => (
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
                      {art.category?.name || 'Story'} · {art.wordCount} words
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-sm font-black font-mono text-text-primary">
                    {(art.viewCount || 0).toLocaleString()}
                  </div>
                  <div className="text-[9px] font-mono text-text-tertiary uppercase">READS</div>
                </div>
              </div>
            ))
          )}
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
            {categoryStats.map((cat: any) => (
              <div key={cat.name} className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="font-semibold text-text-primary">{cat.name}</span>
                  <span className="text-text-tertiary">{cat.count} stories ({cat.percentage}%)</span>
                </div>
                <div className="w-full h-2 bg-surface-muted rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      backgroundColor: cat.color || '#3b82f6',
                      width: `${Math.max(4, cat.percentage)}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Device & Referrer breakdown */}
        <div className="space-y-6">
          {/* Device breakdown */}
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
              Reader Platform Breakdown (Live Data)
            </h3>
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-muted border border-border">
                <div className="flex items-center gap-3">
                  <Smartphone size={20} className="text-brand" />
                  <div>
                    <div className="text-xs font-bold text-text-primary">Mobile Web & PWA</div>
                    <div className="text-[10px] font-mono text-text-tertiary">{deviceBreakdown.mobileCount} events detected</div>
                  </div>
                </div>
                <span className="text-sm font-black font-mono text-text-primary">
                  {deviceBreakdown.mobilePct}%
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-surface-muted border border-border">
                <div className="flex items-center gap-3">
                  <Monitor size={20} className="text-emerald-500" />
                  <div>
                    <div className="text-xs font-bold text-text-primary">Desktop Workstations</div>
                    <div className="text-[10px] font-mono text-text-tertiary">{deviceBreakdown.desktopCount} events detected</div>
                  </div>
                </div>
                <span className="text-sm font-black font-mono text-text-primary">
                  {deviceBreakdown.desktopPct}%
                </span>
              </div>
            </div>
          </div>

          {/* Traffic Referrers */}
          <div className="p-6 rounded-2xl border border-border bg-surface shadow-card space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
              Top Referring Sources
            </h3>
            <div className="space-y-2">
              {topReferrers.length === 0 ? (
                <div className="text-xs font-mono text-text-tertiary">No referrers recorded yet.</div>
              ) : (
                topReferrers.map((ref: any) => (
                  <div key={ref.domain} className="flex items-center justify-between p-2.5 rounded-xl bg-surface-muted border border-border text-xs font-mono">
                    <span className="font-semibold text-text-primary truncate">{ref.domain}</span>
                    <span className="text-text-tertiary font-bold">{ref.count} views</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
