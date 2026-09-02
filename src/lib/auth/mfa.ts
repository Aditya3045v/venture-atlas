import crypto from 'crypto';

/**
 * Generate 8 human-readable recovery codes (format: XXXX-XXXX)
 */
export function generateRecoveryCodes(count = 8): { plain: string[]; hashed: string[] } {
  const plain: string[] = [];
  const hashed: string[] = [];

  for (let i = 0; i < count; i++) {
    const raw = crypto.randomBytes(5).toString('hex').toUpperCase();
    const formatted = `${raw.slice(0, 4)}-${raw.slice(4, 8)}`;
    plain.push(formatted);
    hashed.push(hashRecoveryCode(formatted));
  }

  return { plain, hashed };
}

/**
 * Hash a recovery code with SHA-256 for secure storage
 */
export function hashRecoveryCode(code: string): string {
  const normalized = code.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  return crypto.createHash('sha256').update(normalized).digest('hex');
}
