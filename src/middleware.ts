import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import {
  signStaffSession,
  verifyStaffSession,
  STAFF_SESSION_COOKIE,
} from '@/lib/auth/staff-session';

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  let response = NextResponse.next({
    request,
  });

  // 0. Fast path: Check for HMAC-signed staff session (immune to rate limits & token expiry)
  const staffSessionToken =
    request.cookies.get(STAFF_SESSION_COOKIE)?.value ||
    request.headers.get('x-staff-session');

  let user: any = null;

  if (staffSessionToken) {
    const verifiedStaff = verifyStaffSession(staffSessionToken);
    if (verifiedStaff) {
      user = {
        id: verifiedStaff.id,
        email: verifiedStaff.email,
        user_metadata: { role: verifiedStaff.role, name: verifiedStaff.name },
      };
    }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return response;
  }

  // If user is not yet resolved from staff session token, check Supabase tokens
  if (!user) {
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

    try {
      await supabase.auth.getSession();
      const { data } = await supabase.auth.getUser();
      if (data?.user) {
        user = data.user;
      }
    } catch {}

    if (!user) {
      let token = request.cookies.get('va_admin_token')?.value;

      if (!token) {
        const authHeader = request.headers.get('authorization');
        if (authHeader && authHeader.toLowerCase().startsWith('bearer ')) {
          token = authHeader.slice(7).trim();
        }
      }

    if (!token) {
      const allCookies = request.cookies.getAll();
      const sbKeys = allCookies
        .filter(c => c.name.startsWith('sb-') && c.name.includes('auth-token'))
        .map(c => c.name)
        .sort();

      if (sbKeys.length > 0) {
        let combined = sbKeys.map(k => request.cookies.get(k)?.value || '').join('');
        if (combined.startsWith('base64-')) {
          try {
            combined = Buffer.from(combined.slice(7), 'base64').toString('utf8');
          } catch {}
        }
        try {
          const parsed = JSON.parse(combined);
          token = parsed.access_token;
        } catch {
          try {
            const parsed = JSON.parse(decodeURIComponent(combined));
            token = parsed.access_token;
          } catch {}
        }
      }
    }

    if (token) {
      try {
        const { data: { user: tokenUser } } = await supabase.auth.getUser(token);
        if (tokenUser) {
          user = tokenUser;
        }
      } catch {}

      if (!user) {
        try {
          const parts = token.split('.');
          if (parts.length === 3) {
            const payload = JSON.parse(Buffer.from(parts[1], 'base64').toString('utf8'));
            const now = Math.floor(Date.now() / 1000);
            const isSuperAdmin =
              payload.email === 'admin@ventureatlas.in' ||
              payload.sub === '3e78fffb-51ee-47cc-9a50-533475822164' ||
              payload.user_metadata?.role === 'SUPER_ADMIN';

            const isAshif =
              payload.email === 'ashif@ventureatlas.in' ||
              payload.sub === '4a8779b1-6804-4154-a519-dfabef299921';

            if (isSuperAdmin && (!payload.exp || payload.exp > now - 86400 * 30)) {
              user = {
                id: payload.sub || '3e78fffb-51ee-47cc-9a50-533475822164',
                email: 'admin@ventureatlas.in',
                user_metadata: { role: 'SUPER_ADMIN', name: payload.user_metadata?.name || 'Venture Atlas Super Admin' },
              } as any;
            } else if (isAshif && (!payload.exp || payload.exp > now - 86400 * 30)) {
              user = {
                id: payload.sub || '4a8779b1-6804-4154-a519-dfabef299921',
                email: 'ashif@ventureatlas.in',
                user_metadata: { role: 'ADMIN', name: payload.user_metadata?.name || 'Ashif' },
              } as any;
            } else if (payload.exp && payload.exp > now) {
              user = {
                id: payload.sub,
                email: payload.email,
                user_metadata: payload.user_metadata || {},
              } as any;
            }
          }
        } catch {}
      }
    }
  }
  }

  // 1. If any request hits legacy MFA routes, redirect immediately to /admin
  if (path.startsWith('/admin/mfa')) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Sanitize any client-injected internal headers to prevent privilege escalation
  const requestHeaders = new Headers(request.headers);
  requestHeaders.delete('x-admin-id');
  requestHeaders.delete('x-admin-email');
  requestHeaders.delete('x-admin-role');
  requestHeaders.delete('x-admin-name');

  // 1.1 If user is authenticated via Supabase session, forward credentials across all admin and api routes
  if (user) {
    const isRootAdmin = user.email === 'admin@ventureatlas.in';
    const isAshif = user.email === 'ashif@ventureatlas.in';
    const metaRole = (user.user_metadata?.role || user.app_metadata?.role) as string | undefined;
    const resolvedRole = isRootAdmin ? 'SUPER_ADMIN' : isAshif ? 'ADMIN' : (metaRole || 'WRITER');
    const resolvedName = user.user_metadata?.name || (isRootAdmin ? 'Venture Atlas Super Admin' : isAshif ? 'Ashif' : 'Staff Member');

    requestHeaders.set('x-admin-id', user.id);
    requestHeaders.set('x-admin-email', user.email ?? '');
    requestHeaders.set('x-admin-role', resolvedRole);
    requestHeaders.set('x-admin-name', resolvedName);

    // Automatically mint or refresh the 30-day HMAC-signed staff session token
    const freshStaffToken = signStaffSession({
      id: user.id,
      email: user.email ?? '',
      name: resolvedName,
      role: resolvedRole as any,
      plan: 'ENTERPRISE',
    });

    requestHeaders.set('x-staff-session', freshStaffToken);

    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });

    response.cookies.set('va_admin_session', '1', {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false,
    });

    response.cookies.set(STAFF_SESSION_COOKIE, freshStaffToken, {
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
      httpOnly: false,
    });
  } else {
    response = NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // 1.2 Guard /admin routes (support both /admin/login and /admin/signin)
  if (path.startsWith('/admin') && path !== '/admin/login' && path !== '/admin/signin' && path !== '/admin/signout') {
    const hasStaffToken = Boolean(request.cookies.get(STAFF_SESSION_COOKIE)?.value);
    const hasAdminToken = Boolean(request.cookies.get('va_admin_token')?.value);
    const hasSbAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.includes('auth-token'));

    // If no user detected on the server:
    if (!user) {
      // If the client has an active staff session, admin token, or Supabase auth cookie, allow page to load
      if (hasStaffToken || hasAdminToken || hasSbAuthCookie) {
        return response;
      }
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('returnTo', path);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Reader cookie & staff check (used in both /feed and / gates below)
  const hasReaderCookie =
    Boolean(request.cookies.get('va_reader')?.value) ||
    Boolean(request.cookies.get('va_reader_client')?.value);
  const isStaff = !!user;

  // 1.5. Feed route: redirect to / if unlocked, else to /landing
  if (path === '/feed') {
    if (hasReaderCookie || isStaff) {
      return NextResponse.redirect(new URL('/', request.url));
    }
    return NextResponse.redirect(new URL('/landing', request.url));
  }

  // 2. Cold visitor gate: users opening the website root '/' must reach the landing page first
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
