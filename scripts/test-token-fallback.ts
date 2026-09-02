import { signReaderToken, verifyReaderToken } from '../src/lib/auth/reader';

export {};

delete process.env.READER_COOKIE_SECRET;

const payload = {
  readerId: 'reader-12345',
  email: 'investor@ventureatlas.io',
  createdAt: new Date().toISOString(),
};

console.log('Testing signReaderToken without process.env.READER_COOKIE_SECRET...');
const token = signReaderToken(payload);
console.log('[PASS] Signed token:', token);

const verified = verifyReaderToken(token);
console.log('[PASS] Verified payload:', verified);

if (verified && verified.email === payload.email) {
  console.log('\n[SUCCESS] Token generation and verification works with fallback secret without throwing!');
} else {
  console.error('\n[FAIL] Token verification failed');
  process.exit(1);
}
