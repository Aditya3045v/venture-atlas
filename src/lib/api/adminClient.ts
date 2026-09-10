import { createClient } from '@/lib/supabase/client';

/**
 * Universal authenticated fetch utility for all admin forms and components.
 * Automatically resolves the live Supabase session access token and attaches:
 * 1. Authorization: Bearer <token>
 * 2. credentials: 'include' (cookies)
 */
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const headers = new Headers(init.headers || {});

  try {
    let token: string | undefined;

    // 1. Try Supabase browser client session (with auto-refresh if near expiry)
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.access_token) {
        token = session.access_token;
        const now = Math.floor(Date.now() / 1000);
        if (session.expires_at && session.expires_at - now < 300) {
          try {
            const { data: refreshed } = await supabase.auth.refreshSession();
            if (refreshed.session?.access_token) {
              token = refreshed.session.access_token;
            }
          } catch {}
        }
      }
    } catch {}

    // 2. Fallback: check document.cookie for va_admin_token or sb-*-auth-token chunks
    if (!token && typeof document !== 'undefined') {
      const cookieStr = document.cookie || '';

      const match = cookieStr.match(/(?:^|;\s*)va_admin_token=([^;]+)/);
      if (match && match[1]) {
        token = decodeURIComponent(match[1]);
      }

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

    // 3. Fallback: check localStorage for any Supabase auth token
    if (!token && typeof window !== 'undefined' && window.localStorage) {
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

    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  } catch (err) {
    console.warn('[adminFetch] Could not retrieve Supabase session access token:', err);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });
}
