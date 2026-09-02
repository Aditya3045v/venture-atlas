import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { logAuditEvent } from '@/lib/audit';
import { revalidatePath, revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

/**
 * Scheduled Publishing Worker Route
 * Can be invoked periodically (e.g. by Vercel Cron, Supabase pg_cron, or external health check)
 * Requires Bearer CRON_SECRET authorization header.
 * Transitions articles in 'SCHEDULED' state whose scheduled_for <= NOW() into 'PUBLISHED'.
 */
export async function GET(req: NextRequest) {
  // CRON_SECRET Bearer token protection
  const authHeader = req.headers.get('authorization') || '';
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json(
      { error: 'Unauthorized: Invalid or missing CRON_SECRET token.' },
      { status: 401 }
    );
  }

  try {
    const now = new Date().toISOString();

    // 1. Fetch articles scheduled for on or before right now
    const { data: scheduledArticles, error: fetchError } = await supabaseAdmin
      .from('articles')
      .select('id, title, slug, scheduled_for')
      .eq('status', 'SCHEDULED')
      .lte('scheduled_for', now);

    if (fetchError) {
      console.error('Scheduled publishing fetch error:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    if (!scheduledArticles || scheduledArticles.length === 0) {
      return NextResponse.json({
        message: 'No articles currently pending scheduled release.',
        publishedCount: 0,
        timestamp: now,
      });
    }

    const articleIds = scheduledArticles.map(a => a.id);

    // 2. Transition them to PUBLISHED status
    const { data: updated, error: updateError } = await supabaseAdmin
      .from('articles')
      .update({
        status: 'PUBLISHED' as any,
        published_at: now,
      })
      .in('id', articleIds)
      .select();

    if (updateError) {
      console.error('Scheduled publishing update error:', updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    // 3. Log audit event for each published article
    for (const article of scheduledArticles) {
      await logAuditEvent({
        action: 'AUTO_PUBLISH_SCHEDULED_ARTICLE',
        entityType: 'ARTICLE',
        entityId: article.id,
        metadata: { title: article.title, scheduledFor: article.scheduled_for, publishedAt: now },
      });
    }

    // Invalidate caches
    try {
      revalidateTag('articles');
      for (const article of scheduledArticles) {
        if (article.slug) {
          revalidateTag(`article:${article.slug}`);
          revalidatePath(`/articles/${article.slug}`);
        }
      }
      revalidatePath('/');
      revalidatePath('/articles');
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: `Successfully released ${updated?.length || 0} scheduled articles.`,
      publishedCount: updated?.length || 0,
      publishedArticles: updated,
      timestamp: now,
    });
  } catch (error: any) {
    console.error('Scheduled publisher execution error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to process scheduled publications' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  return GET(req);
}
