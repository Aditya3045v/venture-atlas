import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { z } from 'zod';
import { checkRateLimitAsync } from '@/lib/rate-limit';
import { signReaderToken, READER_COOKIE_NAME } from '@/lib/auth/reader';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const readerEnterSchema = z.object({
  email: z.string().email('Invalid email address'),
  source: z.string().optional().default('LANDING_PAGE'),
});

export async function POST(req: NextRequest) {
  // Rate limiting: 5 per IP per hour
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || '127.0.0.1';
  const rateLimit = await checkRateLimitAsync(`reader_enter:${ip}`, { windowMs: 3600 * 1000, maxRequests: 5 });
  if (!rateLimit.success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded: max 5 registrations per hour. Please try again later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(rateLimit.reset),
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );
  }

  try {
    const body = await req.json();
    const validated = readerEnterSchema.safeParse(body);
    if (!validated.success) {
      return NextResponse.json(
        { error: validated.error.errors[0]?.message || 'Invalid email format' },
        { status: 400 }
      );
    }

    const email = validated.data.email.trim().toLowerCase();
    const source = validated.data.source || 'LANDING_PAGE';
    const readerId = crypto.randomUUID();

    // Use anon request-scoped client for subscriber registration
    let isNewReader = true;
    try {
      const supabase = createServerSupabaseClient();
      
      // Check if subscriber exists
      const { data: existing } = await supabase
        .from('newsletter_subscribers')
        .select('id, reader_id')
        .eq('email', email)
        .single();

      if (existing) {
        isNewReader = false;
        await supabase
          .from('newsletter_subscribers')
          .update({
            reader_id: readerId,
            consent_at: new Date().toISOString(),
            status: 'ACTIVE',
          })
          .eq('id', existing.id);
      } else {
        await supabase
          .from('newsletter_subscribers')
          .insert({
            reader_id: readerId,
            email,
            source,
            consent_at: new Date().toISOString(),
            status: 'ACTIVE',
          });
      }
    } catch {
      // In case table or network miss, reader token still gets issued
    }

    // Sign the HMAC reader token (Guaranteed to contain only readerId, email, createdAt — NO role)
    const token = signReaderToken({
      readerId,
      email,
      createdAt: new Date().toISOString(),
    });

    const response = NextResponse.json(
      {
        success: true,
        isNewReader,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': String(rateLimit.limit),
          'X-RateLimit-Remaining': String(rateLimit.remaining),
        },
      }
    );

    // Set secure va_reader cookie
    response.cookies.set(READER_COOKIE_NAME, token, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60, // 1 year
    });

    return response;
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize reader access' },
      { status: 500 }
    );
  }
}
