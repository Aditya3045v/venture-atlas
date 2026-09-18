import { createClient } from '@supabase/supabase-js';
import dns from 'dns';

// DNS Override: Only apply locally to bypass ISP DNS sinkholing.
// On Vercel, Supabase DNS resolves correctly — skip the patch.
if (typeof dns.lookup === 'function' && !process.env.VERCEL && !(global as any).__supabaseDnsPatched) {
  (global as any).__supabaseDnsPatched = true;
  const origLookup = dns.lookup.bind(dns);
  (dns as any).lookup = function(hostname: string, options: any, callback: any) {
    let cb = callback;
    let opts = options;
    if (typeof opts === 'function') {
      cb = opts;
      opts = {};
    }
    if (hostname === 'fckmhqyhglfnqhpjzrvu.supabase.co') {
      if (opts && opts.all) {
        return cb(null, [
          { address: '104.18.38.10', family: 4 },
          { address: '172.64.149.246', family: 4 },
        ]);
      }
      return cb(null, '104.18.38.10', 4);
    }
    return origLookup(hostname, options, callback);
  };
}

const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  'https://fckmhqyhglfnqhpjzrvu.supabase.co';

const supabaseServiceKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.SUPABASE_SECRET_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('FATAL: Supabase environment variables are not configured.');
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});
