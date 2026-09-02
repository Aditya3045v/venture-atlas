import * as Sentry from '@sentry/nextjs';

export function scrubServerSensitiveData(event: Sentry.ErrorEvent): Sentry.ErrorEvent | null {
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
            lower.includes('key') ||
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

  // 3. Scrub HTTP request headers and body
  if (event.request) {
    if (event.request.headers) {
      delete event.request.headers['authorization'];
      delete event.request.headers['cookie'];
      delete event.request.headers['x-forwarded-for'];
      delete event.request.headers['x-real-ip'];
    }
    if (event.request.cookies) {
      event.request.cookies = {};
    }
    if (event.request.data && typeof event.request.data === 'object') {
      const scrubbedData: Record<string, any> = { ...(event.request.data as Record<string, any>) };
      for (const key of Object.keys(scrubbedData)) {
        const lower = key.toLowerCase();
        if (
          lower.includes('password') ||
          lower.includes('token') ||
          lower.includes('secret') ||
          lower.includes('key') ||
          lower.includes('code')
        ) {
          scrubbedData[key] = '[SCRUBBED]';
        }
      }
      event.request.data = scrubbedData;
    }
  }

  // 4. Scrub environment / extra context
  if (event.extra) {
    const extraRecord = event.extra as Record<string, any>;
    for (const key of Object.keys(extraRecord)) {
      const lower = key.toLowerCase();
      if (
        lower.includes('secret') ||
        lower.includes('token') ||
        lower.includes('key') ||
        lower.includes('password')
      ) {
        delete extraRecord[key];
      }
    }
  }

  return event;
}

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_SENTRY_DSN || '',
  tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
  beforeSend(event) {
    return scrubServerSensitiveData(event);
  },
});
