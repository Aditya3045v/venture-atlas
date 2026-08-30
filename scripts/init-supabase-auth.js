const { createClient } = require('@supabase/supabase-js');

const SUPABASE_URL = 'https://fckmhqyhglfnqhpjzrvu.supabase.co';
const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZja21ocXloZ2xmbnFocGp6cnZ1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODEwMzE2NCwiZXhwIjoyMTAzNjc5MTY0fQ.8EN7V3KaO1D4f93Tq99kRkChO-Lb4U_DxUGUp2F3sKw';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log('🔗 Connecting to Supabase at:', SUPABASE_URL);

  const usersToProvision = [
    {
      email: 'admin@ventureatlas.io',
      password: 'demo-password-123',
      user_metadata: { name: 'Alex Rivera', role: 'ADMIN' },
    },
    {
      email: 'editor@ventureatlas.io',
      password: 'demo-password-123',
      user_metadata: { name: 'Sarah Chen', role: 'EDITOR' },
    },
    {
      email: 'author@ventureatlas.io',
      password: 'demo-password-123',
      user_metadata: { name: 'Devon Scott', role: 'AUTHOR' },
    },
    {
      email: 'reader@ventureatlas.io',
      password: 'demo-password-123',
      user_metadata: { name: 'Priya Mehta', role: 'USER' },
    },
  ];

  for (const u of usersToProvision) {
    console.log(`Checking user ${u.email}...`);
    const { data: existingUsers, error: listErr } = await supabase.auth.admin.listUsers();
    
    const userExists = existingUsers?.users?.find(x => x.email === u.email);

    if (!userExists) {
      console.log(`Creating user ${u.email}...`);
      const { data, error } = await supabase.auth.admin.createUser({
        email: u.email,
        password: u.password,
        email_confirm: true,
        user_metadata: u.user_metadata,
      });

      if (error) {
        console.error(`Error creating ${u.email}:`, error.message);
      } else {
        console.log(`✅ Created Supabase Auth user: ${u.email} (ID: ${data.user.id})`);
      }
    } else {
      console.log(`ℹ️ User ${u.email} already exists in Supabase Auth (ID: ${userExists.id}).`);
      // Update password & metadata just to ensure they are synced
      await supabase.auth.admin.updateUserById(userExists.id, {
        password: u.password,
        user_metadata: u.user_metadata,
      });
    }
  }

  // Create article-media storage bucket if not exists
  console.log('Checking storage bucket...');
  const { data: buckets } = await supabase.storage.listBuckets();
  const bucketExists = buckets?.find(b => b.name === 'article-media');
  if (!bucketExists) {
    const { error: bucketErr } = await supabase.storage.createBucket('article-media', {
      public: true,
    });
    if (bucketErr) {
      console.log('Bucket creation:', bucketErr.message);
    } else {
      console.log('✅ Created storage bucket: article-media');
    }
  } else {
    console.log('ℹ️ Storage bucket article-media exists.');
  }

  console.log('🎉 Supabase Auth & Storage provisioning complete!');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
