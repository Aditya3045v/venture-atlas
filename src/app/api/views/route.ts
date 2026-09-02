import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const BOT_REGEX = /bot|spider|crawl|slurp|duckduckbot|baiduspider|yandexbot|sogou|exabot|facebot|ia_archiver|headlesschrome|lighthouse|bytespider/i;

// In-memory / server timestamp cache for 10-minute deduplication per IP+article
const recentViews = new Map<string, number>();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { articleId, entityId, entityType = 'ARTICLE', path, referrer } = body;
    const targetId = articleId || entityId;

    if (!targetId && !path) {
      return NextResponse.json({ error: 'targetId or path required' }, { status: 400 });
    }

    const userAgent = req.headers.get('user-agent') || 'unknown';
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';

    // 1. Exclude bot user agents
    if (BOT_REGEX.test(userAgent)) {
      return NextResponse.json({ success: true, ignored: true, reason: 'bot_filtered' });
    }

    // 2. Dedupe within 10-minute window
    const dedupeKey = `${clientIp}:${targetId || path}`;
    const lastSeen = recentViews.get(dedupeKey);
    const now = Date.now();

    if (lastSeen && now - lastSeen < 10 * 60 * 1000) {
      return NextResponse.json({ success: true, ignored: true, reason: 'deduped' });
    }

    recentViews.set(dedupeKey, now);

    const ref = referrer || req.headers.get('referer') || 'direct';

    // 3. Write row to view_events
    await supabaseAdmin.from('view_events').insert({
      article_id: targetId || null,
      path: path || null,
      referrer: ref,
      user_agent: userAgent,
    });

    // 4. Increment view count on the corresponding table
    if (targetId) {
      if (entityType === 'BLOG') {
        const { data: blog } = await supabaseAdmin.from('blog_posts').select('view_count').eq('id', targetId).single();
        if (blog) {
          await supabaseAdmin.from('blog_posts').update({ view_count: (blog.view_count || 0) + 1 }).eq('id', targetId);
        }
      } else if (entityType === 'CASE_STUDY') {
        const { data: cs } = await supabaseAdmin.from('case_studies').select('view_count').eq('id', targetId).single();
        if (cs) {
          await supabaseAdmin.from('case_studies').update({ view_count: (cs.view_count || 0) + 1 }).eq('id', targetId);
        }
      } else {
        const { data: art } = await supabaseAdmin.from('articles').select('view_count').eq('id', targetId).single();
        if (art) {
          await supabaseAdmin.from('articles').update({ view_count: (art.view_count || 0) + 1 }).eq('id', targetId);
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || 'Failed to record view' }, { status: 500 });
  }
}
