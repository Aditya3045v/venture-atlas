import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { supabaseAdmin } from '@/lib/supabase/admin';
import { signReaderToken, READER_COOKIE_NAME } from '@/lib/auth/reader';
import { getCurrentUser, canEdit } from '@/lib/auth/staff';

export const dynamic = 'force-dynamic';

const newsletterSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  source: z.string().optional().default('HERO_LANDING'),
});

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
    }

    const validated = newsletterSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const email = validated.data.email.trim().toLowerCase();
    const source = validated.data.source || 'HERO_LANDING';
    const readerId = crypto.randomUUID();

    // Check if subscriber exists
    const { data: existing, error: fetchErr } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, status')
      .eq('email', email)
      .maybeSingle();

    if (fetchErr) {
      console.error('[newsletter] Error querying subscriber:', fetchErr);
    }

    let isNewSubscriber = true;

    if (existing) {
      isNewSubscriber = false;
      const { error: updateErr } = await supabaseAdmin
        .from('newsletter_subscribers')
        .update({
          status: 'ACTIVE',
          consent_at: new Date().toISOString(),
          reader_id: readerId,
        })
        .eq('id', existing.id);

      if (updateErr) {
        console.error('[newsletter] Error updating subscriber:', updateErr);
        return NextResponse.json({ error: 'Failed to update subscriber record' }, { status: 500 });
      }
    } else {
      const { error: insertErr } = await supabaseAdmin
        .from('newsletter_subscribers')
        .insert({
          email,
          source,
          reader_id: readerId,
          consent_at: new Date().toISOString(),
          status: 'ACTIVE',
        });

      if (insertErr) {
        console.error('[newsletter] Error inserting subscriber:', insertErr);
        return NextResponse.json({ error: 'Failed to save email to database' }, { status: 500 });
      }
    }

    // Generate reader token so reader can immediately access the feed without cold barrier
    const token = signReaderToken({
      readerId,
      email,
      createdAt: new Date().toISOString(),
    });

    const response = NextResponse.json(
      {
        success: true,
        message: isNewSubscriber ? 'Successfully subscribed to the Atlas dispatch.' : 'Welcome back to Venture Atlas.',
        email,
        isNewSubscriber,
      },
      { status: 200 }
    );

    // Set reader cookies so middleware grants access to the feed
    response.cookies.set(READER_COOKIE_NAME, token, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });

    // va_reader is the primary cookie checked by middleware
    response.cookies.set('va_reader', '1', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
    });

    response.cookies.set('va_reader_client', '1', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
    });

    return response;
  } catch (error: any) {
    console.error('[newsletter] Unexpected error:', error);
    return NextResponse.json(
      { error: error?.message || 'An unexpected error occurred while capturing your email' },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const staff = await getCurrentUser(req);
  if (!staff || !canEdit(staff.role)) {
    return NextResponse.json({ error: 'Unauthorized: Staff credentials required.' }, { status: 403 });
  }

  try {
    const { data, count, error } = await supabaseAdmin
      .from('newsletter_subscribers')
      .select('id, email, status, source, created_at', { count: 'exact' })
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ totalCount: count, recent: data });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message }, { status: 500 });
  }
}

