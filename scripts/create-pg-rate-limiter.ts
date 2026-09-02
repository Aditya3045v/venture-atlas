export {};

async function main() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  if (!token) {
    console.error('No SUPABASE_ACCESS_TOKEN found in .env');
    process.exit(1);
  }

  const query = `
    CREATE TABLE IF NOT EXISTS public.rate_limits (
        key TEXT PRIMARY KEY,
        count INTEGER NOT NULL DEFAULT 1,
        reset_at TIMESTAMPTZ NOT NULL
    );

    ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

    CREATE OR REPLACE FUNCTION public.check_rate_limit(
        p_key TEXT,
        p_limit INTEGER,
        p_window_seconds INTEGER
    )
    RETURNS TABLE (
        allowed BOOLEAN,
        current_count INTEGER,
        remaining INTEGER,
        reset_seconds INTEGER
    )
    LANGUAGE plpgsql
    SECURITY DEFINER
    AS $$
    DECLARE
        v_now TIMESTAMPTZ := NOW();
        v_reset TIMESTAMPTZ;
        v_count INTEGER;
    BEGIN
        -- Delete expired key if present
        DELETE FROM public.rate_limits WHERE key = p_key AND reset_at < v_now;

        -- Upsert new window or increment existing
        INSERT INTO public.rate_limits (key, count, reset_at)
        VALUES (p_key, 1, v_now + (p_window_seconds || ' seconds')::INTERVAL)
        ON CONFLICT (key) DO UPDATE
        SET count = public.rate_limits.count + 1
        RETURNING public.rate_limits.count, public.rate_limits.reset_at INTO v_count, v_reset;

        RETURN QUERY
        SELECT
            (v_count <= p_limit) AS allowed,
            v_count AS current_count,
            GREATEST(0, p_limit - v_count) AS remaining,
            GREATEST(1, EXTRACT(EPOCH FROM (v_reset - v_now))::INTEGER) AS reset_seconds;
    END;
    $$;
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
  console.log('Postgres rate limiter setup result:', JSON.stringify(data, null, 2));
}

main().catch(console.error);
