import { supabaseAdmin } from './supabase/admin';
import {
  ArticleItem,
  CategoryItem,
  BlogItem,
  CaseStudyItem,
  AuditLogItem,
  UserProfile,
  UserRole,
} from '@/types';

export * from './data/categories';
export * from './data/articles';
export * from './data/case-studies';
export * from './data/blogs';
export * from './data/navigation';

import { fetchArticles } from './data/articles';
import { fetchCategories } from './data/categories';

/**
 * Venture Atlas Pure Supabase Data Layer
 * Single data path: Supabase PostgreSQL (fail-safe and resilient).
 */

export async function fetchAdminDashboardStats() {
  try {
    const [articles, auditLogs, { data: allArticles }] = await Promise.all([
      fetchArticles({ limit: 10, status: 'PUBLISHED' }).catch(() => [] as ArticleItem[]),
      fetchAuditLogs(8).catch(() => [] as AuditLogItem[]),
      supabaseAdmin.from('articles').select('status, view_count'),
    ]);

    const statusCounts = (allArticles || []).reduce((acc: Record<string, number>, art) => {
      acc[art.status] = (acc[art.status] || 0) + 1;
      return acc;
    }, {});

    const totalViews = (allArticles || []).reduce((acc, art) => acc + (art.view_count || 0), 0);

    return {
      totalPublished: statusCounts['PUBLISHED'] || 0,
      totalDrafts: statusCounts['DRAFT'] || 0,
      totalInReview: 0,
      totalScheduled: statusCounts['SCHEDULED'] || 0,
      totalViews,
      articles,
      auditLogs,
    };
  } catch (error: any) {
    console.warn('Failed to fetch admin dashboard stats:', error?.message);
    return {
      totalPublished: 0,
      totalDrafts: 0,
      totalInReview: 0,
      totalScheduled: 0,
      totalViews: 0,
      articles: [],
      auditLogs: [],
    };
  }
}

export async function fetchAdminAnalytics() {
  try {
    const [articles, categories, { data: viewEvents }, { count: subscriberCount }] = await Promise.all([
      fetchArticles({ limit: 50, status: 'PUBLISHED' }).catch(() => []),
      fetchCategories().catch(() => []),
      supabaseAdmin.from('view_events').select('referrer, user_agent, created_at').order('created_at', { ascending: false }).limit(500),
      supabaseAdmin.from('newsletter_subscribers').select('id', { count: 'exact', head: true }),
    ]);

    const topArticles = [...articles]
      .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
      .slice(0, 5);

    const totalArticles = articles.length || 1;
    const categoryStats = categories.map(cat => {
      const catArticles = articles.filter(a => a.categoryId === cat.id);
      const views = catArticles.reduce((sum, a) => sum + (a.viewCount || 0), 0);
      return {
        name: cat.name,
        color: cat.color,
        count: catArticles.length,
        percentage: Math.round((catArticles.length / totalArticles) * 100),
        views,
      };
    });

    // Real device breakdown from view_events user_agent strings
    const events = viewEvents || [];
    let mobileCount = 0;
    let desktopCount = 0;
    const referrerMap: Record<string, number> = {};

    for (const ev of events) {
      const ua = (ev.user_agent || '').toLowerCase();
      if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone') || ua.includes('ipad')) {
        mobileCount++;
      } else {
        desktopCount++;
      }

      let refDomain = 'Direct / Internal';
      if (ev.referrer && ev.referrer !== 'direct') {
        try {
          refDomain = new URL(ev.referrer).hostname.replace('www.', '');
        } catch {
          refDomain = ev.referrer;
        }
      }
      referrerMap[refDomain] = (referrerMap[refDomain] || 0) + 1;
    }

    const totalEvents = events.length;
    const mobilePct = totalEvents > 0 ? Math.round((mobileCount / totalEvents) * 100) : 0;
    const desktopPct = totalEvents > 0 ? Math.round((desktopCount / totalEvents) * 100) : 0;

    const topReferrers = Object.entries(referrerMap)
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      topArticles,
      categoryStats,
      totalViews: events.length,
      deviceBreakdown: {
        mobilePct,
        desktopPct,
        mobileCount,
        desktopCount,
        totalEvents,
      },
      topReferrers,
      subscriberCount: subscriberCount || 0,
    };
  } catch (error: any) {
    console.warn('Failed to fetch admin analytics:', error?.message);
    return {
      topArticles: [],
      categoryStats: [],
      totalViews: 0,
      deviceBreakdown: { mobilePct: 0, desktopPct: 0, mobileCount: 0, desktopCount: 0, totalEvents: 0 },
      topReferrers: [],
      subscriberCount: 0,
    };
  }
}

export async function fetchAdminStats() {
  try {
    const [articlesRes, blogsRes, caseStudiesRes, subscribersRes, usersRes, auditRes] =
      await Promise.all([
        supabaseAdmin.from('articles').select('id, view_count, status', { count: 'exact' }),
        supabaseAdmin.from('blog_posts').select('id, view_count, status', { count: 'exact' }),
        supabaseAdmin.from('case_studies').select('id, view_count, status', { count: 'exact' }),
        supabaseAdmin.from('newsletter_subscribers').select('id', { count: 'exact' }),
        supabaseAdmin.from('profiles').select('id, role', { count: 'exact' }),
        supabaseAdmin.from('audit_logs').select('*').order('created_at', { ascending: false }).limit(6),
      ]);

    const articles = articlesRes.data || [];
    const blogs = blogsRes.data || [];
    const caseStudies = caseStudiesRes.data || [];
    const totalViews =
      articles.reduce((acc, a) => acc + (a.view_count || 0), 0) +
      blogs.reduce((acc, b) => acc + (b.view_count || 0), 0) +
      caseStudies.reduce((acc, c) => acc + (c.view_count || 0), 0);

    const publishedArticles = articles.filter(a => a.status === 'PUBLISHED').length;
    const draftArticles = articles.filter(a => a.status === 'DRAFT').length;
    const totalSubscribers = subscribersRes.count || 0;
    const totalWriters = (usersRes.data || []).filter(u => u.role === 'WRITER' || (u.role as any) === 'AUTHOR').length;

    const recentAudits: AuditLogItem[] = (auditRes.data || []).map(log => ({
      id: log.id,
      actorId: log.actor_id || undefined,
      actorEmail: log.actor_email || 'admin@ventureatlas.in',
      actorRole: log.actor_role || 'ADMIN',
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id || undefined,
      metadata: log.metadata ? JSON.stringify(log.metadata) : undefined,
      ipHash: log.ip_hash || undefined,
      userAgent: log.user_agent || undefined,
      createdAt: new Date(log.created_at),
    }));

    return {
      totalArticles: articles.length,
      publishedArticles,
      draftArticles,
      totalCaseStudies: caseStudies.length,
      totalBlogs: blogs.length,
      totalSubscribers,
      totalViews,
      totalWriters,
      recentAudits,
    };
  } catch (error: any) {
    console.warn('Failed to fetch admin stats from Supabase:', error?.message);
    return {
      totalArticles: 0,
      publishedArticles: 0,
      draftArticles: 0,
      totalCaseStudies: 0,
      totalBlogs: 0,
      totalSubscribers: 0,
      totalViews: 0,
      totalWriters: 0,
      recentAudits: [],
    };
  }
}

export async function fetchAuditLogs(limit = 50): Promise<AuditLogItem[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.warn('Supabase fetchAuditLogs warning:', error.message);
      return [];
    }

    return (data || []).map(log => ({
      id: log.id,
      actorId: log.actor_id || undefined,
      actorEmail: log.actor_email || 'system@ventureatlas.in',
      actorRole: log.actor_role || 'ADMIN',
      action: log.action,
      entityType: log.entity_type,
      entityId: log.entity_id || undefined,
      metadata: log.metadata ? JSON.stringify(log.metadata) : undefined,
      ipHash: log.ip_hash || undefined,
      userAgent: log.user_agent || undefined,
      createdAt: new Date(log.created_at),
    }));
  } catch (error: any) {
    console.warn('Failed to fetch audit logs from Supabase:', error?.message);
    return [];
  }
}

export const fetchAdminAuditLogs = fetchAuditLogs;

export async function fetchAdminUsers(): Promise<UserProfile[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) {
      return [];
    }

    return data.map(u => ({
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      avatar: u.avatar,
      plan: u.plan || 'FREE',
      mfaEnabled: false,
      bio: u.bio,
    }));
  } catch (error: any) {
    console.error('Failed to fetch admin users from Supabase:', error?.message);
    return [];
  }
}

export async function deleteAdminUser(id: string): Promise<boolean> {
  try {
    const { error } = await supabaseAdmin
      .from('profiles')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Supabase deleteAdminUser error:', error.message);
      return false;
    }

    return true;
  } catch (error: any) {
    console.error(`Failed to delete admin user "${id}" from Supabase:`, error?.message);
    return false;
  }
}
