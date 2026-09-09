import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  let response = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        response = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options)
        );
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();

  // 1. If any request hits legacy MFA routes, redirect immediately to /admin
  if (path.startsWith('/admin/mfa')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Guard /admin routes
  if (path.startsWith('/admin') && path !== '/admin/login' && path !== '/admin/signout') {
    if (!user) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnTo', path);
      return NextResponse.redirect(loginUrl);
    }

    // Resilient staff role resolution:
    // Fast path: inspect metadata or root admin first to avoid network latency/timeouts on page switches
    const metaRole = (user.user_metadata?.role || user.app_metadata?.role) as string | undefined;
    const isRootAdmin = user.email === 'admin@ventureatlas.in';

    if (isRootAdmin || (metaRole && ['ADMIN', 'EDITOR', 'WRITER'].includes(metaRole))) {
      return response;
    }

    // Fallback: query profiles table if metadata wasn't cached
    try {
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
    } catch {
      // In case of transient database error, keep session active
    }

    // Direct, frictionless access to admin dashboard
    return response;
  }

  // 2. Cold visitor gate: users opening the website root '/' must reach the landing page first
  const hasReaderCookie =
    Boolean(request.cookies.get('va_reader')?.value) ||
    Boolean(request.cookies.get('va_reader_client')?.value);
  const isStaff = !!user;

  if (path === '/') {
    if (!hasReaderCookie && !isStaff) {
      const landingUrl = new URL('/landing', request.url);
      return NextResponse.redirect(landingUrl);
    }
    return response;
  }

  // 3. Public SEO & Content Routes (Accessible to crawlers, search engines & visitors)
  const isPublicOpenRoute =
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
    path.match(/\.(png|jpg|jpeg|gif|svg|ico|webp|mp3|mp4|webm|txt|xml)$/);

  if (!isPublicOpenRoute) {
    if (!hasReaderCookie && !isStaff) {
      const landingUrl = new URL('/landing', request.url);
      return NextResponse.redirect(landingUrl);
    }
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp3|mp4|webm)$).*)',
  ],
};
