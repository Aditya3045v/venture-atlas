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

  // 1. Guard /admin routes
  if (path.startsWith('/admin') && path !== '/admin/login' && path !== '/admin/signout' && !path.startsWith('/admin/mfa')) {
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnTo', path);
      return NextResponse.redirect(loginUrl);
    }

    // Verify staff role
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    const role = profile?.role;
    if (!role || !['ADMIN', 'EDITOR', 'WRITER'].includes(role)) {
      const loginUrl = new URL('/admin/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // MFA enforcement removed - direct access to admin panel

    return response;
  }

  // 2. Public SEO & Content Routes (Accessible to crawlers, search engines & visitors)
  const isPublicOpenRoute =
    path === '/' ||
    path === '/landing' ||
    path.startsWith('/articles/') ||
    path.startsWith('/blogs') ||
    path.startsWith('/case-studies') ||
    path.startsWith('/categories') ||
    path.startsWith('/authors') ||
    path.startsWith('/about') ||
    path.startsWith('/search') ||
    path.startsWith('/api/') ||
    path.startsWith('/admin') ||
    path.startsWith('/sitemap') ||
    path === '/privacy' ||
    path === '/terms' ||
    path === '/imprint' ||
    path === '/cookies' ||
    path === '/robots.txt' ||
    path.startsWith('/_next') ||
    path.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|mp3|txt|xml)$/);

  if (!isPublicOpenRoute) {
    const hasReaderCookie =
      Boolean(request.cookies.get('va_reader')?.value) ||
      Boolean(request.cookies.get('va_reader_client')?.value);
    const isStaff = !!user;

    if (!hasReaderCookie && !isStaff) {
      // Redirect unverified visitor smoothly to landing page to enter email
      const landingUrl = new URL('/landing', request.url);
      return NextResponse.redirect(landingUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3)$).*)',
  ],
};
