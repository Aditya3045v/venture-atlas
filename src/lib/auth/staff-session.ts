import crypto from 'crypto';
import type { UserRole } from '@/types';

export const STAFF_SESSION_COOKIE = 'va_staff_session';

export interface StaffSessionPayload {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  plan?: string;
  iat?: number;
  exp?: number;
}

function getStaffSecretKey(): string {
  return (
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.READER_COOKIE_SECRET ||
    'va-staff-auth-session-key-2026-production-salt'
  );
}

/**
 * Generates an HMAC-SHA256 signed session token for verified staff members.
 * Valid for 30 days. Immune to Supabase Auth rate limits and 1-hour token expiry.
 */
export function signStaffSession(user: {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
  plan?: string | null;
}): string {
  const secret = getStaffSecretKey();
  const payload: StaffSessionPayload = {
    id: user.id,
    email: user.email,
    name: user.name || 'Staff Member',
    role: user.role,
    plan: user.plan || 'ENTERPRISE',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
  };

  const jsonStr = JSON.stringify(payload);
  const dataB64 = Buffer.from(jsonStr, 'utf-8').toString('base64url');
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(dataB64);
  const sigB64 = hmac.digest('base64url');
  return `${dataB64}.${sigB64}`;
}

/**
 * Verifies an HMAC-SHA256 signed staff session token.
 * Returns decoded payload or null if invalid, expired, or tampered.
 */
export function verifyStaffSession(token?: string | null): StaffSessionPayload | null {
  if (!token || typeof token !== 'string') return null;
  const parts = token.split('.');
  if (parts.length !== 2) return null;

  const [dataB64, sigB64] = parts;
  if (!dataB64 || !sigB64) return null;

  try {
    const secret = getStaffSecretKey();
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(dataB64);
    const expectedSigB64 = hmac.digest('base64url');

    const sigBuf = Buffer.from(sigB64, 'base64url');
    const expectedBuf = Buffer.from(expectedSigB64, 'base64url');

    if (sigBuf.length !== expectedBuf.length || !crypto.timingSafeEqual(sigBuf, expectedBuf)) {
      return null;
    }

    const jsonStr = Buffer.from(dataB64, 'base64url').toString('utf-8');
    const parsed: StaffSessionPayload = JSON.parse(jsonStr);
    const now = Math.floor(Date.now() / 1000);

    if (parsed.exp && parsed.exp < now) {
      return null;
    }

    if (!parsed.id || !parsed.email || !parsed.role) {
      return null;
    }

    const isOwner = parsed.email === 'admin@ventureatlas.in';

    return {
      id: parsed.id,
      email: parsed.email,
      name: parsed.name || (isOwner ? 'Venture Atlas Super Admin' : 'Staff Member'),
      role: isOwner ? 'SUPER_ADMIN' : parsed.role,
      plan: parsed.plan || 'ENTERPRISE',
      exp: parsed.exp,
      iat: parsed.iat,
    };
  } catch {
    return null;
  }
}
