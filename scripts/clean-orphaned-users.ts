import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, email, name, role, created_at')
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching profiles:', error);
    process.exit(1);
  }

  console.log('=== BEFORE CLEANUP: PROFILES COUNT =', profiles.length, '===');
  console.log(JSON.stringify(profiles, null, 2));

  // The legitimate accounts are:
  // 1. admin@ventureatlas.io (Real Admin)
  // 2. adityapoddarmain@gmail.com (Owner Admin)
  // 3. writer.test@ventureatlas.io (Test Writer)
  // 4. editor.test@ventureatlas.io (Test Editor)
  // 5. admin.test@ventureatlas.io (Test Admin)

  const legitEmails = [
    'admin@ventureatlas.io',
    'adityapoddarmain@gmail.com',
    'writer.test@ventureatlas.io',
    'editor.test@ventureatlas.io',
    'admin.test@ventureatlas.io',
  ];

  const toDelete = profiles.filter(p => !legitEmails.includes(p.email || ''));
  console.log(`\nFound ${toDelete.length} orphaned/temp accounts to delete.`);

  for (const orphan of toDelete) {
    console.log(`Deleting orphan: ${orphan.email} (${orphan.id})...`);
    // Delete profile
    await supabase.from('profiles').delete().eq('id', orphan.id);
    // Delete from auth.users
    await supabase.auth.admin.deleteUser(orphan.id);
  }

  const { data: remaining } = await supabase
    .from('profiles')
    .select('id, email, name, role, created_at')
    .order('created_at', { ascending: true });

  console.log('\n=== AFTER CLEANUP: PROFILES COUNT =', remaining?.length, '===');
  console.log(JSON.stringify(remaining, null, 2));
}

main().catch(console.error);
