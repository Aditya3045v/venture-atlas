/**
 * scripts/delete-test-staff.ts
 *
 * Deletes the three test staff accounts created by seed-staff.ts.
 * Run this before production launch.
 *
 * ⚠️  IRREVERSIBLE — this permanently deletes the auth users and profiles.
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const TEST_EMAILS = [
  'writer.test@ventureatlas.io',
  'editor.test@ventureatlas.io',
  'admin.test@ventureatlas.io',
];

async function deleteTestStaff() {
  console.log('======================================================');
  console.log('        DELETE TEST STAFF ACCOUNTS                   ');
  console.log('======================================================\n');

  const { data: list } = await admin.auth.admin.listUsers();
  const users = list?.users ?? [];

  for (const email of TEST_EMAILS) {
    const user = users.find(u => u.email === email);
    if (!user) {
      console.log(`${email} — not found, skipping`);
      continue;
    }

    await admin.from('profiles').delete().eq('id', user.id);
    const { error } = await admin.auth.admin.deleteUser(user.id);
    if (error) {
      console.error(`FAILED to delete ${email}: ${error.message}`);
    } else {
      console.log(`DELETED ${email} (id=${user.id})`);
    }
  }

  console.log('\nDone.\n');
}

deleteTestStaff().catch(e => { console.error(e); process.exit(1); });
