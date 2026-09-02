import * as Sentry from '@sentry/nextjs';

function scrubSensitiveData(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
  if (!event) return event;

  // 1. Scrub breadcrumbs
  if (event.breadcrumbs) {
    event.breadcrumbs = event.breadcrumbs.map(b => {
      if (b.data && typeof b.data === 'object') {
        const cleanedData = { ...b.data };
        for (const key of Object.keys(cleanedData)) {
          const lower = key.toLowerCase();
          if (
            lower.includes('password') ||
            lower.includes('token') ||
            lower.includes('secret') ||
            lower.includes('cookie') ||
            lower.includes('auth')
          ) {
            cleanedData[key] = '[SCRUBBED]';
          }
        }
        b.data = cleanedData;
      }
      return b;
    });
  }

  // 2. Scrub user info
  if (event.user) {
    if (event.user.email) {
      const [user, domain] = event.user.email.split('@');
      event.user.email = `${user.slice(0, 2)}***@${domain || 'masked.com'}`;
    }
    delete (event.user as any).ip_address;
  }

  // 3. Scrub request headers & cookies
  if (event.request) {
    if (event.request.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-forwarded-for'];
    }
    if (event.request.cookies) {
      event.request.cookies = {};
    }
  }

  return event;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
  beforeSend(event) {
    return scrubSensitiveData(event);
  },
});
