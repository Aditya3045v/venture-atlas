import { createClient } from '@supabase/supabase-js';

export {};

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

const PRIMARY_ADMIN_EMAIL = 'admin@ventureatlas.io';
const PRIMARY_ADMIN_PASSWORD = 'Atlas#Vault9872!AdminEnterprise$X';
const PRIMARY_ADMIN_NAME = 'Venture Atlas Root Admin';

async function main() {
  console.log('====================================================');
  console.log('  PROVISION SINGLE PRIMARY ADMIN & PURGE ALL OTHERS  ');
  console.log('====================================================\n');

  const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

  // 1. Fetch all existing auth users
  const { data: usersData, error: listErr } = await supabase.auth.admin.listUsers({ perPage: 100 });
  if (listErr) {
    console.error('Failed to list users:', listErr.message);
    process.exit(1);
  }

  const allUsers = usersData?.users || [];
  console.log(`Found ${allUsers.length} total users in Supabase Auth.`);

  // 2. Delete all non-primary users
  for (const user of allUsers) {
    if (user.email !== PRIMARY_ADMIN_EMAIL) {
      console.log(`Purging user: ${user.email} (${user.id})...`);
      await supabase.from('profiles').delete().eq('id', user.id);
      await supabase.auth.admin.deleteUser(user.id);
    }
  }

  // 3. Purge any leftover profiles not tied to primary admin
  const { data: profiles } = await supabase.from('profiles').select('id, email');
  for (const p of profiles || []) {
    if (p.email !== PRIMARY_ADMIN_EMAIL) {
      console.log(`Purging orphaned profile: ${p.email} (${p.id})...`);
      await supabase.from('profiles').delete().eq('id', p.id);
    }
  }

  // 4. Ensure Primary Admin exists with secure credentials
  const existingPrimary = allUsers.find(u => u.email === PRIMARY_ADMIN_EMAIL);
  let adminId = '';

  if (existingPrimary) {
    console.log(`\nUpdating existing primary admin (${PRIMARY_ADMIN_EMAIL})...`);
    adminId = existingPrimary.id;
    await supabase.auth.admin.updateUserById(adminId, {
      password: PRIMARY_ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: PRIMARY_ADMIN_NAME, role: 'ADMIN' },
    });
  } else {
    console.log(`\nCreating fresh primary admin (${PRIMARY_ADMIN_EMAIL})...`);
    const { data: newAdmin, error: createErr } = await supabase.auth.admin.createUser({
      email: PRIMARY_ADMIN_EMAIL,
      password: PRIMARY_ADMIN_PASSWORD,
      email_confirm: true,
      user_metadata: { name: PRIMARY_ADMIN_NAME, role: 'ADMIN' },
    });
    if (createErr || !newAdmin.user) {
      console.error('Failed to create primary admin:', createErr?.message);
      process.exit(1);
    }
    adminId = newAdmin.user.id;
  }

  // 5. Ensure profile is ADMIN
  await supabase.from('profiles').upsert({
    id: adminId,
    email: PRIMARY_ADMIN_EMAIL,
    name: PRIMARY_ADMIN_NAME,
    role: 'ADMIN',
    plan: 'ENTERPRISE',
    updated_at: new Date().toISOString(),
  });

  // 6. Verification
  const { data: finalUsers } = await supabase.auth.admin.listUsers();
  const { data: finalProfiles } = await supabase.from('profiles').select('id, email, name, role');

  console.log('\n====================================================');
  console.log('REMAINING AUTH USERS:', JSON.stringify(finalUsers?.users.map(u => ({ id: u.id, email: u.email })), null, 2));
  console.log('REMAINING PROFILES:', JSON.stringify(finalProfiles, null, 2));
  console.log('====================================================\n');
  console.log(`[SUCCESS] Exactly 1 Admin account configured: ${PRIMARY_ADMIN_EMAIL}`);
}

main().catch(console.error);
