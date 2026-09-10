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

    // 1. Try Supabase browser client session
    try {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      token = session?.access_token;
    } catch {}

    // 2. Fallback: check va_admin_token cookie
    if (!token && typeof document !== 'undefined') {
      const match = document.cookie.match(/(?:^|;\s*)va_admin_token=([^;]+)/);
      if (match && match[1]) {
        token = match[1];
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
