export {};

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const res = await fetch('https://api.supabase.com/v1/projects/fckmhqyhglfnqhpjzrvu/database/query', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      query: "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'comments' ORDER BY ordinal_position;",
    }),
  });

  const data = await res.json();
  console.log('=== COMMENTS TABLE COLUMNS ===');
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
