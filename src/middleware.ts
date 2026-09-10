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

  // Use getSession first (refreshes token if needed), then getUser for security validation
  await supabase.auth.getSession();
  const { data: { user } } = await supabase.auth.getUser();

  // 1. If any request hits legacy MFA routes, redirect immediately to /admin
  if (path.startsWith('/admin/mfa')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Guard /admin routes (support both /admin/login and /admin/signin)
  if (path.startsWith('/admin') && path !== '/admin/login' && path !== '/admin/signin' && path !== '/admin/signout') {
    const hasAdminSessionCookie = request.cookies.get('va_admin_session')?.value === '1';
    const hasSbAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.includes('auth-token'));

    // If no user detected on the server:
    if (!user) {
      // If the client has an active admin cookie or Supabase auth cookie, do NOT bounce prematurely.
      // Allow the request to pass through to the page where AdminAuthGuard restores the session via getSession().
      if (hasAdminSessionCookie || hasSbAuthCookie) {
        return response;
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnTo', path);
      return NextResponse.redirect(loginUrl);
    }

    // User is verified: resolve role
    const metaRole = (user.user_metadata?.role || user.app_metadata?.role) as string | undefined;
    const isRootAdmin = user.email === 'admin@ventureatlas.in';
    let resolvedRole = isRootAdmin ? 'SUPER_ADMIN' : (metaRole || 'WRITER');
    let resolvedName = user.user_metadata?.name || (isRootAdmin ? 'Venture Atlas Super Admin' : 'Staff Member');

    if (!isRootAdmin && (!metaRole || !['SUPER_ADMIN', 'ADMIN', 'EDITOR', 'WRITER', 'REVIEWER', 'MEDIA_MANAGER'].includes(metaRole))) {
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role, name, is_active')
          .eq('id', user.id)
          .single();

        if (profile?.is_active === false) {
          const loginUrl = new URL('/admin/login', request.url);
          return NextResponse.redirect(loginUrl);
        }

        if (profile?.role && profile.role !== 'READER') {
          resolvedRole = profile.role;
          if (profile.name) resolvedName = profile.name;
        } else if (!hasAdminSessionCookie) {
          const loginUrl = new URL('/admin/login', request.url);
          return NextResponse.redirect(loginUrl);
        }
      } catch {
        // In case of transient database error, keep session active
      }
    }

    // Forward request headers so Server Components (layout, getCurrentUser) receive them directly
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-admin-id', user.id);
    requestHeaders.set('x-admin-email', user.email ?? '');
    requestHeaders.set('x-admin-role', resolvedRole);
    requestHeaders.set('x-admin-name', resolvedName);

    const forwardResponse = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    // Copy any cookies set by Supabase SSR
    response.cookies.getAll().forEach(c => {
      forwardResponse.cookies.set(c);
    });

    // Keep the admin session cookie synchronized
    forwardResponse.cookies.set('va_admin_session', '1', {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false,
    });

    return forwardResponse;
  }

  // 1.5. Feed route: intentional visitor transition into the reader feed
  if (path === '/feed') {
    const feedResponse = NextResponse.redirect(new URL('/', request.url));
    feedResponse.cookies.set('va_reader', '1', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
    });
    feedResponse.cookies.set('va_reader_client', '1', {
      path: '/',
      httpOnly: false,
      sameSite: 'lax',
      maxAge: 365 * 24 * 60 * 60,
    });
    return feedResponse;
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
