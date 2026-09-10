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
    const supabase = createClient();
    const { data: { session } } = await supabase.auth.getSession();
    const token = session?.access_token;

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
