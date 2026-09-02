import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

async function check() {
  const tables = [
    'profiles',
    'articles',
    'blog_posts',
    'case_studies',
    'categories',
    'newsletter_subscribers',
    'comments',
    'audit_logs',
    'media_assets',
    'bookmarks',
    'likes',
    'view_events',
  ];

  console.log('--- SUPABASE LIVE DATABASE AUDIT ---');
  console.log('Project URL:', process.env.NEXT_PUBLIC_SUPABASE_URL);
  console.log('Project Ref:', new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname.split('.')[0]);
  console.log('------------------------------------');

  for (const t of tables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (error) {
      console.log(`${t.padEnd(25)} : ERROR (${error.message})`);
    } else {
      console.log(`${t.padEnd(25)} : ${count} rows`);
    }
  }

  const { data: authUsers } = await supabase.auth.admin.listUsers();
  console.log('------------------------------------');
  console.log(`Supabase Auth Users       : ${authUsers?.users?.length || 0} registered accounts`);
}

check().catch(console.error);
