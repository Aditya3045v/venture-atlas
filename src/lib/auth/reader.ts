import crypto from 'crypto';
import { cookies } from 'next/headers';

export const READER_COOKIE_NAME = 'va_reader';

export interface ReaderContext {
  readerId: string;
  email: string;
  createdAt: string;
}

function getSecretKey(): string {
  const secret =
    process.env.READER_COOKIE_SECRET ||
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'va-secret-reader-cookie-hmac-v1-production-salt-key-998877';
  return secret;
}

/**
 * Signs a payload using HMAC SHA-256
 * Output format: base64(JSON(payload)).base64(HMAC_SHA256(base64(JSON(payload))))
 */
export function signReaderToken(payload: ReaderContext): string {
  const secret = getSecretKey();
  const jsonStr = JSON.stringify(payload);
  const dataB64 = Buffer.from(jsonStr, 'utf-8').toString('base64url');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(dataB64);
  const sigB64 = hmac.digest('base64url');
  return `${dataB64}.${sigB64}`;
}

/**
 * Verifies a signed HMAC SHA-256 reader token
 * Returns parsed ReaderContext or null if invalid or tampered
 */
export function verifyReaderToken(token: string): ReaderContext | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [dataB64, sigB64] = parts;
  if (!dataB64 || !sigB64) return null;

  try {
    const secret = getSecretKey();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(dataB64);
    const expectedSigB64 = hmac.digest('base64url');

    const sigBuf = Buffer.from(sigB64, 'base64url');
    const expectedBuf = Buffer.from(expectedSigB64, 'base64url');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const jsonStr = Buffer.from(dataB64, 'base64url').toString('utf-8');
    const parsed = JSON.parse(jsonStr);

    if (!parsed || typeof parsed !== 'object') return null;
    if (typeof parsed.readerId !== 'string' || !parsed.readerId) return null;
    if (typeof parsed.email !== 'string' || !parsed.email) return null;
    if (typeof parsed.createdAt !== 'string') return null;

    // Guaranteed to only return readerId, email, and createdAt. NEVER returns a role.
    return {
      readerId: parsed.readerId,
      email: parsed.email,
      createdAt: parsed.createdAt,
    };
  } catch {
    return null;
  }
}

/**
 * Reads and verifies the signed va_reader cookie from incoming request.
 * Returns ReaderContext or null. NEVER returns a role field.
 */
export async function getReader(): Promise<ReaderContext | null> {
  try {
    const cookieStore = cookies();
    const rawToken = cookieStore.get(READER_COOKIE_NAME)?.value;
    if (!rawToken) return null;
    return verifyReaderToken(rawToken);
  } catch {
    return null;
  }
}

/**
 * Generates an HMAC-signed unsubscribe token for newsletter recipients
 */
export function generateUnsubscribeToken(email: string): string {
  const secret = getSecretKey();
  const payload = { email, type: 'unsubscribe', ts: Date.now() };
  const dataB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(dataB64);
  const sigB64 = hmac.digest('base64url');
  return `${dataB64}.${sigB64}`;
}

/**
 * Verifies an unsubscribe token and returns the verified email or null
 */
export function verifyUnsubscribeToken(token: string): string | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [dataB64, sigB64] = parts;
  try {
    const secret = getSecretKey();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(dataB64);
    const expectedSigB64 = hmac.digest('base64url');

    const sigBuf = Buffer.from(sigB64, 'base64url');
    const expectedBuf = Buffer.from(expectedSigB64, 'base64url');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const jsonStr = Buffer.from(dataB64, 'base64url').toString('utf-8');
    const parsed = JSON.parse(jsonStr);
    if (parsed.type === 'unsubscribe' && typeof parsed.email === 'string') {
      return parsed.email;
    }
    return null;
  } catch {
    return null;
  }
}
