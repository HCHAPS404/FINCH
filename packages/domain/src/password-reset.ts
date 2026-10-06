/**
 * Password reset token expiry — ADR-0041.
 *
 * Only the pure, clock-based check lives here. Generating the token and hashing it
 * need a real random source and a hash function — Node-specific concerns that live
 * with the rest of ADR-0041's adapter code in `apps/api/src/infrastructure/security/`,
 * same split `AuthSessionPort` already has from `DevAuthSessionAdapter`.
 */
import type { Clock } from './clock.js';

export const PASSWORD_RESET_TTL_MS = 30 * 60 * 1000; // 30 minutes.

export function isResetTokenExpired(expiresAt: Date, clock: Clock): boolean {
  return clock.now().getTime() >= expiresAt.getTime();
}
