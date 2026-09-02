/**
 * scripts/seed-staff.ts
 *
 * Creates three test Supabase Auth users with matching profiles rows.
 * Reads all credentials from environment — nothing hardcoded.
 * Idempotent: safe to re-run; existing accounts are left unchanged.
 *
 * ⚠️  WARNING: THESE ARE TEST ACCOUNTS ONLY.
 *     Delete them before production launch via: npx tsx --env-file=.env scripts/delete-test-staff.ts
 */
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL    = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SERVICE_KEY     = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const WRITER_PW       = process.env.TEST_WRITER_PASSWORD!;
const EDITOR_PW       = process.env.TEST_EDITOR_PASSWORD!;
const ADMIN_PW        = process.env.TEST_ADMIN_PASSWORD!;

if (!SUPABASE_URL || !SERVICE_KEY || !WRITER_PW || !EDITOR_PW || !ADMIN_PW) {
  console.error('Missing required env vars. Check .env for SUPABASE_URL, SERVICE_ROLE_KEY, and TEST_*_PASSWORD.');
  process.exit(1);
}

const admin = createClient(SUPABASE_URL, SERVICE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const STAFF = [
  { email: 'writer.test@ventureatlas.io',  password: WRITER_PW, role: 'WRITER', name: 'Test Writer'  },
  { email: 'editor.test@ventureatlas.io',  password: EDITOR_PW, role: 'EDITOR', name: 'Test Editor'  },
  { email: 'admin.test@ventureatlas.io',   password: ADMIN_PW,  role: 'ADMIN',  name: 'Test Admin'   },
];

async function seedStaff() {
  console.log('======================================================');
  console.log('        SEED TEST STAFF ACCOUNTS                     ');
  console.log('======================================================\n');

  for (const s of STAFF) {
    process.stdout.write(`Seeding ${s.email} (${s.role})... `);

    // Check if auth user already exists
    const { data: list } = await admin.auth.admin.listUsers();
    const existing = list?.users?.find(u => u.email === s.email);

    let userId: string;

    if (existing) {
      console.log(`already exists (id=${existing.id}) — skipping auth create`);
      userId = existing.id;
    } else {
      const { data: created, error: createErr } = await admin.auth.admin.createUser({
        email: s.email,
        password: s.password,
        email_confirm: true,
        user_metadata: { name: s.name },
      });

      if (createErr || !created.user) {
        console.error(`FAILED to create auth user: ${createErr?.message}`);
        process.exit(1);
      }
      userId = created.user.id;
      console.log(`auth user created (id=${userId})`);
    }

    // Upsert profile row
    const { error: profileErr } = await admin
      .from('profiles')
      .upsert({
        id:   userId,
        email: s.email,
        name:  s.name,
        role:  s.role,
        plan:  'ENTERPRISE',
      }, { onConflict: 'id' });

    if (profileErr) {
      console.error(`  FAILED to upsert profile: ${profileErr.message}`);
      process.exit(1);
    }

    // Verify profile row
    const { data: row } = await admin
      .from('profiles')
      .select('id, email, name, role')
      .eq('id', userId)
      .single();

    console.log(`  profile → ${JSON.stringify(row)}`);
  }

  console.log('\n======================================================');
  console.log('SEED COMPLETE — 3 test accounts ready.');
  console.log('⚠️  Run delete-test-staff.ts before production launch!');
  console.log('======================================================\n');
}

seedStaff().catch(e => { console.error(e); process.exit(1); });
