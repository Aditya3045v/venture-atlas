import { SITE_URL, SITE_HOST } from './site-url';
export { SITE_URL, SITE_HOST };

export const INDEXNOW_KEY = process.env.INDEXNOW_KEY || 'a1f49b8e23c04297b649d21e87a3560f';

export async function submitIndexNow(urls: string | string[]): Promise<{ success: boolean; status?: number; data?: any; error?: string }> {
  const urlList = Array.isArray(urls) ? urls : [urls];
  const baseUrl = SITE_URL;

  const fullUrls = urlList.map(u => (u.startsWith('http') ? u : `${baseUrl}${u.startsWith('/') ? '' : '/'}${u}`));

  const payload = {
    host: SITE_HOST,
    key: INDEXNOW_KEY,
    keyLocation: `${baseUrl}/${INDEXNOW_KEY}.txt`,
    urlList: fullUrls,
  };

  try {
    const res = await fetch('https://api.indexnow.org/indexnow', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const isOk = res.ok || res.status === 200 || res.status === 202;
    let responseData = null;
    try {
      const text = await res.text();
      if (text) responseData = JSON.parse(text);
    } catch {}

    return {
      success: isOk,
      status: res.status,
      data: responseData,
    };
  } catch (err: any) {
    console.error('IndexNow ping error:', err);
    return {
      success: false,
      error: err?.message || 'IndexNow fetch network error',
    };
  }
}
