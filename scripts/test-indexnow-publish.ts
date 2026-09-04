import { submitIndexNow, INDEXNOW_KEY, SITE_HOST } from '../src/lib/indexnow';

async function main() {
  console.log('=== TEST INDEXNOW DIRECT SUBMISSION ===');
  console.log('Host:', SITE_HOST);
  console.log('Key:', INDEXNOW_KEY);

  const testUrl = 'https://ventureatlas.in/articles/stripe-6b-round-2027-ipo';
  console.log('Submitting test URL to https://api.indexnow.org/indexnow:', testUrl);

  const result = await submitIndexNow(testUrl);
  console.log('IndexNow Response Status:', result.status);
  console.log('IndexNow Success Flag:', result.success);
  console.log('IndexNow Data:', result.data);
  if (result.error) console.error('IndexNow Error:', result.error);

  console.log('\n=== DIRECT FETCH TO INDEXNOW API ===');
  const directPayload = {
    host: 'ventureatlas.in',
    key: INDEXNOW_KEY,
    keyLocation: `https://ventureatlas.in/${INDEXNOW_KEY}.txt`,
    urlList: [
      'https://ventureatlas.in/articles/stripe-6b-round-2027-ipo',
      'https://ventureatlas.in/case-studies/stripe-infrastructure-leverage',
    ],
  };

  const directRes = await fetch('https://api.indexnow.org/indexnow', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(directPayload),
  });

  console.log('Direct IndexNow HTTP Status:', directRes.status, directRes.statusText);
  const directText = await directRes.text();
  console.log('Direct IndexNow HTTP Body:', directText || '(empty body - 200/202 accepted standard)');
}

main().catch(console.error);
