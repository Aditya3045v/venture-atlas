/**
 * Universal authenticated fetch utility for all admin forms and components.
 * Automatically resolves the live Supabase session access token and attaches:
 * 1. Authorization: Bearer <token>
 * 2. credentials: 'include' (cookies)
 *
 * Fully resilient against ISP DNS sinkholing (e.g. ACT Fibernet / Airtel in India)
 * by prioritizing client cookies and local storage tokens without blocking on external Supabase network calls.
 */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});

  try {
    let token: string | undefined;

    // 1. Fast path: check document.cookie for explicit va_staff_session and va_admin_token
    if (typeof document !== 'undefined') {
      const cookieStr = document.cookie || '';

      const staffMatch = cookieStr.match(/(?:^|;\s*)va_staff_session=([^;]+)/);
      if (staffMatch && staffMatch[1]) {
        headers.set('x-staff-session', decodeURIComponent(staffMatch[1]));
      }

      const match = cookieStr.match(/(?:^|;\s*)va_admin_token=([^;]+)/);
      if (match && match[1]) {
        token = decodeURIComponent(match[1]);
      }

      // Reassemble chunked Supabase cookies if va_admin_token wasn't set
      if (!token) {
        const cookies: Record<string, string> = {};
        cookieStr.split(';').forEach(c => {
          const idx = c.indexOf('=');
          if (idx > -1) {
            cookies[c.slice(0, idx).trim()] = c.slice(idx + 1).trim();
          }
        });
        const sbKeys = Object.keys(cookies).filter(k => k.startsWith('sb-') && k.includes('auth-token')).sort();
        if (sbKeys.length > 0) {
          let combined = sbKeys.map(k => cookies[k]).join('');
          if (combined.startsWith('base64-')) {
            try {
              combined = atob(combined.slice(7));
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
    }

    // 2. Fast path fallback: check localStorage for staff session or Supabase auth token
    if (typeof window !== 'undefined' && window.localStorage) {
      if (!headers.has('x-staff-session')) {
        const storedStaff = localStorage.getItem('va_staff_session');
        if (storedStaff) {
          headers.set('x-staff-session', storedStaff);
        }
      }

      if (!token) {
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('-auth-token') || key.includes('sb-'))) {
            try {
              const raw = localStorage.getItem(key);
              if (raw) {
                const parsed = JSON.parse(raw);
                if (parsed?.access_token) {
                  token = parsed.access_token;
                  break;
                }
              }
            } catch {}
          }
        }
      }
    }

    // 3. Fallback: try Supabase browser client session with a 1.2s timeout so it never hangs on blocked ISPs
    if (!token) {
      try {
        const { createClient } = await import('@/lib/supabase/client');
        const supabase = createClient();
        const sessionPromise = supabase.auth.getSession();
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Supabase getSession timeout')), 1200)
        );

        const result: any = await Promise.race([sessionPromise, timeoutPromise]);
        if (result?.data?.session?.access_token) {
          token = result.data.session.access_token;
        }
      } catch {}
    }

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  } catch (err) {
    console.warn('[adminFetch] Could not retrieve session access token:', err);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });
}
