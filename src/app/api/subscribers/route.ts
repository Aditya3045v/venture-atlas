import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email || !email.includes('@') || !email.includes('.')) {
      return NextResponse.json({ error: 'Please enter a valid work email.' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Create or sync user in Supabase Auth & Database
    let supabaseUserId = null;
    try {
      const { data: existingUser } = await supabaseAdmin.auth.admin.listUsers();
      const match = existingUser?.users?.find(u => u.email === normalizedEmail);

      if (!match) {
        const { data: newUser } = await supabaseAdmin.auth.admin.createUser({
          email: normalizedEmail,
          password: 'reader-access-2026',
          email_confirm: true,
          user_metadata: { role: 'USER', name: normalizedEmail.split('@')[0], source: 'LANDING_GATE' },
        });
        if (newUser?.user) {
          supabaseUserId = newUser.user.id;
        }
      } else {
        supabaseUserId = match.id;
      }

      // Also record in supabase subscribers table
      try {
        await supabaseAdmin.from('newsletter_subscribers').upsert({
          email: normalizedEmail,
          source: 'LANDING_PAGE_GATE',
        });
      } catch {
        // ignore
      }
    } catch (sbErr) {
      console.warn('Supabase user creation notice:', sbErr);
    }

    // 2. Upsert in Prisma Database if available
    try {
      await Promise.all([
        prisma.newsletterSubscriber.upsert({
          where: { email: normalizedEmail },
          update: {},
          create: {
            email: normalizedEmail,
            source: 'LANDING_PAGE_GATE',
          },
        }),
        prisma.user.upsert({
          where: { email: normalizedEmail },
          update: {},
          create: {
            email: normalizedEmail,
            name: normalizedEmail.split('@')[0],
            role: 'USER',
            passwordHash: 'supabase-authenticated',
            plan: 'READER',
          },
        }),
      ]);
    } catch {
      // safe fallback
    }

    await logAuditEvent({
      action: 'UNLOCK_NEWS_FEED',
      entityType: 'USER',
      actor: {
        id: supabaseUserId || `usr-${normalizedEmail}`,
        email: normalizedEmail,
        name: normalizedEmail.split('@')[0],
        role: 'USER',
        plan: 'READER',
        mfaEnabled: false,
      },
      metadata: { email: normalizedEmail, supabaseId: supabaseUserId },
    });

    const response = NextResponse.json({
      success: true,
      message: 'Access granted. News wire unlocked.',
      email: normalizedEmail,
    });

    // Set unlocking cookies for 365 days
    response.cookies.set('va_unlocked_user', normalizedEmail, {
      path: '/',
      httpOnly: false, // Accessible to client components for instant reactive unblur
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });

    response.cookies.set('va_session_user', normalizedEmail, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365,
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to unlock wire. Please try again.' }, { status: 500 });
  }
}
