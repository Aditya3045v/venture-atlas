import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { getCurrentUser } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  const user = await getCurrentUser();

  try {
    const { articleId, saved } = await req.json();
    if (!articleId) {
      return NextResponse.json({ error: 'articleId required' }, { status: 400 });
    }

    if (!user) {
      return NextResponse.json({ success: true }); // Client side fallback
    }

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

    return NextResponse.json({ success: true, saved });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update bookmark' }, { status: 500 });
  }
}
