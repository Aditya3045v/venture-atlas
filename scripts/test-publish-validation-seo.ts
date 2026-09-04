import { createClient } from '@supabase/supabase-js';
import { createBrowserClient } from '@supabase/ssr';

async function main() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  const sb = createClient(supabaseUrl, serviceKey);

  console.log('--- 1. AUTHENTICATING AS ADMIN VIA SSR COOKIES ---');
  const cookieMap = new Map<string, string>();
  const client = createBrowserClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      get(name) { return cookieMap.get(name); },
      set(name, value) { cookieMap.set(name, value); },
      remove(name) { cookieMap.delete(name); },
    },
  });

  const { data: auth, error: authError } = await client.auth.signInWithPassword({
    email: 'admin@ventureatlas.io',
    password: 'AtlasAdmin2026!',
  });

  if (authError || !auth.session) {
    console.error('Auth failed:', authError);
    process.exit(1);
  }

  const session = auth.session;
  const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
  const rawJson = JSON.stringify({
    access_token: session.access_token,
    refresh_token: session.refresh_token,
    token_type: 'bearer',
    expires_in: 3600,
    expires_at: Math.floor(Date.now() / 1000) + 3600,
    user: session.user,
  });
  const b64 = Buffer.from(rawJson).toString('base64');
  cookieMap.set(`sb-${projectRef}-auth-token`, `base64-${b64}`);

  const cookieHeader = Array.from(cookieMap.entries())
    .map(([k, v]) => `${k}=${v}`)
    .join('; ');

  const { data: categories } = await sb.from('categories').select('id, slug').limit(1);
  const categoryId = categories![0].id;

  const baseUrl = 'http://localhost:3000';

  console.log('\n--- 2. ATTEMPTING PUBLISH WITHOUT SEO TITLE ---');
  const resNoSeoTitle = await fetch(`${baseUrl}/api/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      title: 'Test Publish Missing SEO Title 1788',
      summary: 'This is a test 60-word summary to check blocking validation without meta title.',
      body: 'Full content body for testing SEO validation.',
      categoryId,
      status: 'PUBLISHED',
      seoTitle: '',
      seoDescription: 'Valid meta description present here for test.',
      coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
      photoCredit: 'Photo by Unsplash',
    }),
  });

  console.log('Status code:', resNoSeoTitle.status);
  const jsonNoSeoTitle = await resNoSeoTitle.json();
  console.log('Response body:', JSON.stringify(jsonNoSeoTitle, null, 2));

  console.log('\n--- 3. ATTEMPTING PUBLISH WITHOUT SEO DESCRIPTION ---');
  const resNoSeoDesc = await fetch(`${baseUrl}/api/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      title: 'Test Publish Missing SEO Desc 1788',
      summary: 'This is a test 60-word summary to check blocking validation without meta desc.',
      body: 'Full content body for testing SEO validation.',
      categoryId,
      status: 'PUBLISHED',
      seoTitle: 'Valid SEO Title Here',
      seoDescription: '',
      coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
      photoCredit: 'Photo by Unsplash',
    }),
  });

  console.log('Status code:', resNoSeoDesc.status);
  const jsonNoSeoDesc = await resNoSeoDesc.json();
  console.log('Response body:', JSON.stringify(jsonNoSeoDesc, null, 2));

  console.log('\n--- 4. ATTEMPTING PUBLISH WITHOUT COVER IMAGE ALT TEXT ---');
  const resNoAltText = await fetch(`${baseUrl}/api/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      title: 'Test Publish Missing Alt Text 1788',
      summary: 'This is a test 60-word summary to check blocking validation without alt text.',
      body: 'Full content body for testing SEO validation.',
      categoryId,
      status: 'PUBLISHED',
      seoTitle: 'Valid SEO Title Here',
      seoDescription: 'Valid SEO Description Here',
      coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
      photoCredit: '',
    }),
  });

  console.log('Status code:', resNoAltText.status);
  const jsonNoAltText = await resNoAltText.json();
  console.log('Response body:', JSON.stringify(jsonNoAltText, null, 2));

  console.log('\n--- 5. PUBLISH WITH ALL SEO AND ALT TEXT FIELDS FILLED ---');
  const resSuccess = await fetch(`${baseUrl}/api/articles`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookieHeader,
    },
    body: JSON.stringify({
      title: 'Valid Published Article 1788',
      summary: 'This is a compliant 60-word summary overview of venture funding.',
      body: 'Full body text with verified reporting.',
      categoryId,
      status: 'PUBLISHED',
      seoTitle: 'Valid Compliant Meta Title',
      seoDescription: 'Valid compliant meta description for search engines.',
      coverImage: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c',
      photoCredit: 'Unsplash / Enterprise Lens',
    }),
  });

  console.log('Status code:', resSuccess.status);
  const jsonSuccess = await resSuccess.json();
  console.log('Publish result:', jsonSuccess.article ? 'SUCCESS (Created Article ID: ' + jsonSuccess.article.id + ')' : JSON.stringify(jsonSuccess, null, 2));

  if (jsonSuccess.article?.id) {
    await sb.from('articles').delete().eq('id', jsonSuccess.article.id);
    console.log('Cleaned up test article:', jsonSuccess.article.id);
  }
}

main().catch(console.error);
