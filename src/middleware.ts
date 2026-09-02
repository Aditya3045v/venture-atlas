import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set(name: string, value: string, options: CookieOptions) {
        request.cookies.set({ name, value, ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value, ...options });
      },
      remove(name: string, options: CookieOptions) {
        request.cookies.set({ name, value: '', ...options });
        response = NextResponse.next({
          request: {
            headers: request.headers,
          },
        });
        response.cookies.set({ name, value: '', ...options });
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // Guard /admin routes
  if (path.startsWith('/admin') && path !== '/admin/login' && path !== '/admin/signout') {
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnTo', path);
      return NextResponse.redirect(loginUrl);
    }

    if (!path.startsWith('/admin/mfa')) {
      const { data: aalData } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single();

      const role = profile?.role;
      if (role === 'ADMIN' || role === 'EDITOR') {
        if (aalData?.currentLevel !== 'aal2') {
          const redirectPath = aalData?.nextLevel === 'aal2' ? '/admin/mfa/challenge' : '/admin/mfa/enroll';
          const redirectUrl = new URL(redirectPath, request.url);
          redirectUrl.searchParams.set('returnTo', path);
          return NextResponse.redirect(redirectUrl);
        }
      } else if (role === 'WRITER' && aalData?.nextLevel === 'aal2' && aalData?.currentLevel !== 'aal2') {
        const challengeUrl = new URL('/admin/mfa/challenge', request.url);
        challengeUrl.searchParams.set('returnTo', path);
        return NextResponse.redirect(challengeUrl);
      }
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)',
  ],
};
