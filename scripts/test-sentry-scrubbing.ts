import * as Sentry from '@sentry/nextjs';
import { scrubServerSensitiveData } from '../sentry.server.config';

export {};

async function main() {
  console.log('====================================================');
  console.log('       SENTRY PII SCRUBBING AUDIT & PROOF           ');
  console.log('====================================================\n');

  console.log('[1] Generating raw error event with sensitive headers, tokens, and PII...');
  const mockRawEvent: any = {
    event_id: 'd3b07384d113edec49eaa6238ad5ff00',
    type: undefined,
    timestamp: Date.now() / 1000,
    platform: 'node',
    level: 'error',
    exception: {
      values: [
        {
          type: 'Error',
          value: 'Database connection failed for user test.writer@ventureatlas.io with token eyJhbGciOiJIUzI1Ni...',
        },
      ],
    },
    user: {
      id: 'usr_12345',
      email: 'sensitive.admin@ventureatlas.io',
      ip_address: '198.51.100.42',
      username: 'admin_user',
    },
    request: {
      url: 'https://ventureatlas.io/api/admin/users',
      method: 'POST',
      headers: {
        'authorization': 'Bearer sbp_secret_access_token_12345',
        'cookie': 'sb-fckmhqyhglfnqhpjzrvu-auth-token=["access_token_secret","refresh_token_secret"]; va_reader=token_secret;',
        'x-forwarded-for': '198.51.100.42',
        'host': 'ventureatlas.io',
      },
      data: {
        password: 'SuperSecretPassword123!',
        token: 'raw_service_role_secret',
        email: 'user.personal@gmail.com',
      },
    },
    breadcrumbs: [
      {
        message: 'User entered credentials',
        data: {
          password: 'SuperSecretPassword123!',
          auth_token: 'secret_token_123',
        },
      },
    ],
  };

  console.log('\n--- RAW EVENT HEADERS & USER (BEFORE SCRUBBING) ---');
  console.log('Request Headers:', JSON.stringify(mockRawEvent.request?.headers, null, 2));
  console.log('User Object:', JSON.stringify(mockRawEvent.user, null, 2));
  console.log('Request Data:', JSON.stringify(mockRawEvent.request?.data, null, 2));

  // Run the actual beforeSend hook from sentry.server.config.ts
  const scrubbed = scrubServerSensitiveData(JSON.parse(JSON.stringify(mockRawEvent)));

  console.log('\n--- SCRUBBED EVENT HEADERS & USER (SENT TO SENTRY) ---');
  console.log('Request Headers:', JSON.stringify(scrubbed?.request?.headers, null, 2));
  console.log('User Object:', JSON.stringify(scrubbed?.user, null, 2));
  console.log('Request Data:', JSON.stringify(scrubbed?.request?.data, null, 2));
  console.log('Breadcrumbs Data:', JSON.stringify(scrubbed?.breadcrumbs?.[0]?.data, null, 2));

  // Assertions
  const hasAuthHeader = !!scrubbed?.request?.headers?.['authorization'];
  const hasCookieHeader = !!scrubbed?.request?.headers?.['cookie'];
  const hasIp = !!scrubbed?.user?.ip_address || !!scrubbed?.request?.headers?.['x-forwarded-for'];
  const rawEmailExposed = scrubbed?.user?.email === 'sensitive.admin@ventureatlas.io';
  const rawPasswordExposed = (scrubbed?.request?.data as any)?.password === 'SuperSecretPassword123!';
  const breadcrumbPasswordExposed = (scrubbed?.breadcrumbs?.[0]?.data as any)?.password === 'SuperSecretPassword123!';

  console.log('\n--- VERIFICATION CHECKS ---');
  console.log(`  • Authorization header removed: ${!hasAuthHeader}`);
  console.log(`  • Cookie header removed: ${!hasCookieHeader}`);
  console.log(`  • IP address removed: ${!hasIp}`);
  console.log(`  • User email masked: ${scrubbed?.user?.email}`);
  console.log(`  • Request password scrubbed: ${(scrubbed?.request?.data as any)?.password}`);
  console.log(`  • Breadcrumb secrets scrubbed: ${(scrubbed?.breadcrumbs?.[0]?.data as any)?.password}`);

  if (!hasAuthHeader && !hasCookieHeader && !hasIp && !rawEmailExposed && !rawPasswordExposed && !breadcrumbPasswordExposed) {
    console.log('\n====================================================');
    console.log('[SUCCESS] Sentry beforeSend PII & secret scrubbing verified.');
    console.log('====================================================');
  } else {
    console.error('\n[FAIL] Sentry PII scrubbing failed.');
    process.exit(1);
  }
}

main().catch(console.error);
