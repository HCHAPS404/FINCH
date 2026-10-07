/**
 * Password reset token generation/hashing — ADR-0041. The raw token is returned to
 * the caller exactly once (dev-gated API response, future email body); only its hash
 * is ever persisted (`security.password_reset_tokens.token_hash`), so a leaked
 * database row cannot itself be used to reset a password.
 */
import { randomBytes, createHash } from 'node:crypto';

const TOKEN_BYTES = 32;

export function generateResetToken(): string {
  return randomBytes(TOKEN_BYTES).toString('base64url');
}

export function hashResetToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
