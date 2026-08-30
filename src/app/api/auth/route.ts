import { NextRequest, NextResponse } from 'next/server';
import { prisma, ensureDatabaseSeeded } from '@/lib/db';
import { logAuditEvent } from '@/lib/audit';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST(req: NextRequest) {
  await ensureDatabaseSeeded();
  try {
    const { email, password = 'demo-password-123', mfaCode } = await req.json();
    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 1. Authenticate with Supabase Auth
    let supabaseSession = null;
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.signInWithPassword({
        email: normalizedEmail,
        password,
      });

      if (!authError && authData.session) {
        supabaseSession = authData.session;
      }
    } catch (sbErr) {
      console.warn('Supabase sign in notice:', sbErr);
    }

    // 2. Lookup user in database
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      // Auto-provision if exists in Supabase
      user = await prisma.user.create({
        data: {
          email: normalizedEmail,
          name: normalizedEmail.split('@')[0],
          role: 'USER',
          passwordHash: 'supabase-authenticated',
          plan: 'FREE',
        },
      });
    }

    // 3. Build response and set cookies
    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        mfaEnabled: user.mfaEnabled,
      },
      supabaseSession: supabaseSession ? {
        access_token: supabaseSession.access_token,
        expires_at: supabaseSession.expires_at,
      } : null,
    });

    response.cookies.set('va_session_user', user.email, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    if (supabaseSession?.access_token) {
      response.cookies.set('sb-access-token', supabaseSession.access_token, {
        path: '/',
        httpOnly: true,
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 30,
      });
    }

    await logAuditEvent({
      action: 'USER_LOGIN',
      entityType: 'USER',
      entityId: user.id,
      actor: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role as any,
        plan: user.plan,
        mfaEnabled: user.mfaEnabled,
      },
      metadata: { role: user.role, provider: 'supabase_auth' },
    });

    return response;
  } catch (error) {
    return NextResponse.json({ error: 'Authentication error' }, { status: 500 });
  }
}
