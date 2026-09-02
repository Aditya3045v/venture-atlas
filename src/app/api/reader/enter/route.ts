import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { signReaderToken, READER_COOKIE_NAME } from '@/lib/auth/reader';
import { supabaseAdmin } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

const readerEnterSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional().default('LANDING_PAGE'),
});

export async function POST(req: NextRequest) {
  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON payload' },
        { status: 400 }
      );
    }

    const validated = readerEnterSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    const email = validated.data.email.trim().toLowerCase();
    const source = validated.data.source || 'LANDING_PAGE';
    const readerId = crypto.randomUUID();

    // Use admin client to reliably record subscriber in Supabase
    let isNewReader = true;
    try {
      // Check if subscriber exists
      const { data: existing } = await supabaseAdmin
        .from('newsletter_subscribers')
        .select('id, reader_id')
        .eq('email', email)
        .maybeSingle();

      if (existing) {
        isNewReader = false;
        await supabaseAdmin
          .from('newsletter_subscribers')
          .update({
            reader_id: readerId,
            consent_at: new Date().toISOString(),
            status: 'ACTIVE',
          })
          .eq('id', existing.id);
      } else {
        await supabaseAdmin
          .from('newsletter_subscribers')
          .insert({
            reader_id: readerId,
            email,
            source,
            consent_at: new Date().toISOString(),
            status: 'ACTIVE',
          });
      }
    } catch (dbErr) {
      console.warn('[reader/enter] DB subscriber sync warning (proceeding with session token):', dbErr);
    }

    // Sign the HMAC reader token (Guaranteed to contain readerId, email, createdAt — NO staff role)
    const token = signReaderToken({
      readerId,
      email,
      createdAt: new Date().toISOString(),
    });

    const response = NextResponse.json(
      {
        success: true,
        isNewReader,
        email,
        token,
      },
      {
        status: 200,
      }
    );

    // Set cookies accessible across all paths with 1-year maxAge
    response.cookies.set(READER_COOKIE_NAME, token, {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });

    response.cookies.set('va_reader_client', '1', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });

    return response;
  } catch (error: any) {
    console.error('[reader/enter] Error processing reader login:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize reader access' },
      { status: 500 }
    );
  }
}
