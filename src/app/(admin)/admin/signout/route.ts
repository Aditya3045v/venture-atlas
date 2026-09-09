import { createServerSupabaseClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

async function performSignOut(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    await supabase.auth.signOut();
  } catch {
    // Ignore signout errors
  }

  const loginUrl = new URL('/admin/login', request.url);
  const response = NextResponse.redirect(loginUrl);

  // Explicitly purge all Supabase and Venture Atlas auth cookies from client
  try {
    const cookieStore = cookies();
    const allCookies = cookieStore.getAll();
    allCookies.forEach((c) => {
      if (c.name.startsWith('sb-') || c.name.startsWith('va_')) {
        response.cookies.set({
          name: c.name,
          value: '',
          path: '/',
          maxAge: 0,
        });
      }
    });
  } catch {
    // Ignore
  }

  return response;
}

export async function GET(request: Request) {
  return performSignOut(request);
}

export async function POST(request: Request) {
  return performSignOut(request);
}

