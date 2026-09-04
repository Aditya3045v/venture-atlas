import { supabaseAdmin } from '../src/lib/supabase/admin';

async function p() {
  const { data } = await supabaseAdmin.from('profiles').select('id, email, name, role');
  console.log('Profiles in DB:');
  console.log(JSON.stringify(data, null, 2));
}

p().catch(console.error);
