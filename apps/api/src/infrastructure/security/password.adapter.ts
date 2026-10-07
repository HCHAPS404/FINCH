/**
 * Password hashing — ADR-0041. Node's built-in `crypto.scrypt` (CPU/memory-hard, no
 * new dependency), random salt per password, constant-time comparison on verification
 * — the same `timingSafeEqual` primitive `DevAuthSessionAdapter` already uses for its
 * HMAC check.
 *
 * Stored as `scrypt$N$r$p$saltHex$hashHex` so `security.credentials.password_algo`
 * can version the scheme later without a migration (ADR-0041, Decision).
 */
import { randomBytes, scrypt, timingSafeEqual } from 'node:crypto';

const SCRYPT_N = 16384;
const SCRYPT_R = 8;
const SCRYPT_P = 1;
const KEY_LENGTH = 64;
const SALT_LENGTH = 16;

function scryptAsync(
  password: string,
  salt: Buffer,
  keyLength: number,
  options: { N: number; r: number; p: number },
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, keyLength, options, (error, derivedKey) => {
      if (error) {
        reject(error);
        return;
      }
      resolve(derivedKey);
    });
  });
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(SALT_LENGTH);
  const derivedKey = await scryptAsync(password, salt, KEY_LENGTH, {
    N: SCRYPT_N,
    r: SCRYPT_R,
    p: SCRYPT_P,
  });
  return `scrypt$${SCRYPT_N}$${SCRYPT_R}$${SCRYPT_P}$${salt.toString('hex')}$${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const parts = stored.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') {
    return false;
  }
  const [, nRaw, rRaw, pRaw, saltHex, hashHex] = parts;
  if (
    nRaw === undefined ||
    rRaw === undefined ||
    pRaw === undefined ||
    saltHex === undefined ||
    hashHex === undefined
  ) {
    return false;
  }
  const N = Number(nRaw);
  const r = Number(rRaw);
  const p = Number(pRaw);
  if (!Number.isFinite(N) || !Number.isFinite(r) || !Number.isFinite(p)) {
    return false;
  }

  const salt = Buffer.from(saltHex, 'hex');
  const expected = Buffer.from(hashHex, 'hex');
  const derivedKey = await scryptAsync(password, salt, expected.length, { N, r, p });

  return derivedKey.length === expected.length && timingSafeEqual(derivedKey, expected);
}
