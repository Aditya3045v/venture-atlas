export {};

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error('No SUPABASE_ACCESS_TOKEN');
    process.exit(1);
  }

  const res = await fetch('https://api.supabase.com/v1/projects/fckmhqyhglfnqhpjzrvu/database/query', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: "SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public' ORDER BY tablename;",
    }),
  });

  const data = await res.json();
  console.log('=== PG_TABLES IN PUBLIC SCHEMA (ROWSECURITY STATUS) ===');
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
