export {};

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error('No SUPABASE_ACCESS_TOKEN found in .env');
    process.exit(1);
  }

  const query = `
    ALTER TABLE public.articles ADD COLUMN IF NOT EXISTS canvas_data JSONB;
    ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS canvas_data JSONB;
    ALTER TABLE public.case_studies ADD COLUMN IF NOT EXISTS canvas_data JSONB;
  `;

  const res = await fetch('https://api.supabase.com/v1/projects/fckmhqyhglfnqhpjzrvu/database/query', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query }),
  });

  const data = await res.json();
  console.log('Migration result:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
