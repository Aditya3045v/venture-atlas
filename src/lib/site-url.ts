/**
 * Single source of truth for the publication's base URL and hostname.
 * Strictly validates NEXT_PUBLIC_APP_URL with zero fallbacks.
 * Throws at initialization/build time if missing, set to localhost in production,
 * or pointing to the legacy .io domain.
 */
function resolveSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_APP_URL?.trim();

  if (!url) {
    throw new Error(
      'CRITICAL CONFIG ERROR: NEXT_PUBLIC_APP_URL environment variable is unset. A valid public URL (e.g. https://ventureatlas.in) must be configured.'
    );
  }

  if (url.includes('ventureatlas.io')) {
    throw new Error(
      `CRITICAL CONFIG ERROR: NEXT_PUBLIC_APP_URL contains invalid domain "ventureatlas.io". The production domain is "https://ventureatlas.in".`
    );
  }

  if (process.env.NODE_ENV === 'production' && (url.includes('localhost') || url.includes('127.0.0.1'))) {
    throw new Error(
      `CRITICAL CONFIG ERROR: NEXT_PUBLIC_APP_URL cannot be set to "${url}" in production mode. Set NEXT_PUBLIC_APP_URL=https://ventureatlas.in.`
    );
  }

  // Normalize: remove trailing slash
  return url.replace(/\/+$/, '');
}

export const SITE_URL = resolveSiteUrl();

export function getSiteUrl(): string {
  return SITE_URL;
}

export function getSiteHost(): string {
  try {
    return new URL(SITE_URL).host;
  } catch {
    return SITE_URL.replace(/^https?:\/\//, '').split('/')[0];
  }
}

export const SITE_HOST = getSiteHost();
