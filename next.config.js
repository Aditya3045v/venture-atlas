/** @type {import('next').NextConfig} */
const dns = require('dns');

// DNS Override: Only apply locally to bypass ISP DNS sinkholing (e.g. ACT Fibernet).
// On Vercel/production, Supabase DNS resolves correctly — skip the patch.
const isVercel = !!process.env.VERCEL;
if (!isVercel && typeof dns.lookup === 'function' && !global.__supabaseDnsPatched) {
  global.__supabaseDnsPatched = true;
  const origLookup = dns.lookup;
  dns.lookup = function(hostname, options, callback) {
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
    if (hostname === 'fonts.gstatic.com') {
      if (opts && opts.all) {
        return cb(null, [{ address: '142.251.221.163', family: 4 }]);
      }
      return cb(null, '142.251.221.163', 4);
    }
    if (hostname === 'fonts.googleapis.com') {
      if (opts && opts.all) {
        return cb(null, [{ address: '142.250.193.202', family: 4 }]);
      }
      return cb(null, '142.250.193.202', 4);
    }
    return origLookup(hostname, options, callback);
  };
}
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline';
  style-src 'self' 'unsafe-inline' https:;
  img-src 'self' blob: data: https:;
  font-src 'self' data: https: https://fonts.gstatic.com;
  connect-src 'self' https: wss:;
  media-src 'self' blob: data: https:;
  frame-ancestors 'none';
  object-src 'none';
  base-uri 'self';
  form-action 'self';
`.replace(/\s{2,}/g, ' ').trim();

const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy,
  },
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
];

const nextConfig = {
  reactStrictMode: true,
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ];
  },
};

module.exports = nextConfig;
