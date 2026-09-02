export {};

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error('No SUPABASE_ACCESS_TOKEN found in .env');
    process.exit(1);
  }

  const query = `
    CREATE TABLE IF NOT EXISTS public.navigation_items (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        label TEXT NOT NULL,
        href TEXT NOT NULL,
        order_num INTEGER NOT NULL DEFAULT 0,
        is_active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    ALTER TABLE public.navigation_items ENABLE ROW LEVEL SECURITY;

    DROP POLICY IF EXISTS "Public can read active navigation items" ON public.navigation_items;
    CREATE POLICY "Public can read active navigation items"
    ON public.navigation_items
    FOR SELECT
    TO anon, authenticated
    USING (is_active = TRUE);

    DROP POLICY IF EXISTS "Staff can manage navigation items" ON public.navigation_items;
    CREATE POLICY "Staff can manage navigation items"
    ON public.navigation_items
    FOR ALL
    TO authenticated
    USING (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('ADMIN', 'EDITOR')
      )
    )
    WITH CHECK (
      EXISTS (
        SELECT 1 FROM public.profiles
        WHERE profiles.id = auth.uid()
        AND profiles.role IN ('ADMIN', 'EDITOR')
      )
    );

    -- Clear existing and seed standard default navigation items with Home first
    DELETE FROM public.navigation_items;
    INSERT INTO public.navigation_items (label, href, order_num, is_active)
    VALUES
        ('Home', '/', 0, TRUE),
        ('Unicorn', '/categories/unicorn', 1, TRUE),
        ('Failure', '/categories/failure', 2, TRUE),
        ('Finance', '/categories/finance', 3, TRUE),
        ('Crypto Web3', '/categories/crypto-web3', 4, TRUE),
        ('Founder Biography', '/categories/founder-biography', 5, TRUE),
        ('Case Studies', '/case-studies', 6, TRUE),
        ('Blogs', '/blogs', 7, TRUE);
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
  console.log('Navigation table migration result:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
