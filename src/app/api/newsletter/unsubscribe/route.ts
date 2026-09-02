import { NextRequest, NextResponse } from 'next/server';
import { verifyUnsubscribeToken } from '@/lib/auth/reader';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { token, email: rawEmail } = await req.json();

    let targetEmail: string | null = null;

    if (token) {
      targetEmail = verifyUnsubscribeToken(token);
    } else if (rawEmail && typeof rawEmail === 'string' && rawEmail.includes('@')) {
      targetEmail = rawEmail.trim().toLowerCase();
    }

    if (!targetEmail) {
      return NextResponse.json(
        { error: 'Invalid or expired unsubscribe token.' },
        { status: 400 }
      );
    }

    try {
      const supabase = createServerSupabaseClient();
      await supabase
        .from('newsletter_subscribers')
        .update({ status: 'UNSUBSCRIBED' })
        .eq('email', targetEmail);
    } catch {
      // ignore
    }

    return NextResponse.json({
      success: true,
      message: `You have been unsubscribed from Venture Atlas briefs (${targetEmail}).`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to process unsubscribe request.' }, { status: 500 });
  }
}
