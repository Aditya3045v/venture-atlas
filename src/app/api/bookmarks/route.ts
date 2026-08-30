import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { getCurrentUser } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();

  try {
    const { articleId, saved } = await req.json();
    if (!articleId) {
      return NextResponse.json({ error: 'articleId required' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ success: true, saved });
    }

    // 1. Try Supabase
    try {
      if (saved) {
        await supabaseAdmin.from('bookmarks').upsert({
          user_id: user.id,
          article_id: articleId,
        });
      } else {
        await supabaseAdmin.from('bookmarks').delete().match({
          user_id: user.id,
          article_id: articleId,
        });
      }
    } catch {
      // fallback
    }

    // 2. Try Prisma
    try {
      if (saved) {
        await prisma.bookmark.upsert({
          where: {
            userId_articleId: {
              userId: user.id,
              articleId,
            },
          },
          update: {},
          create: {
            userId: user.id,
            articleId,
          },
        });
      } else {
        await prisma.bookmark.deleteMany({
          where: {
            userId: user.id,
            articleId,
          },
        });
      }
    } catch {
      // safe fallback
    }

    return NextResponse.json({ success: true, saved });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}
