/**
 * Auth session port — README §8, §9, ADR-0015.
 *
 * ADR-0015 (identity provider) is still **Proposed** — no vendor has been chosen. Per
 * ADR-0022, the domain defines the shape a session takes; a vendor-shaped adapter
 * (OIDC, JWT, whatever ADR-0015 eventually settles on) lives at a composition root,
 * never here. Foundation's only concrete implementation is a dev-only sandbox adapter
 * in `apps/api`, which is why this file stays silent about tokens or claims formats.
 */
import type { PrincipalId } from '@finch/contracts';
import type { Clock } from './clock.js';

export interface AuthSession {
  readonly principalId: PrincipalId;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
}

export interface AuthSessionPort {
  verify(token: string): Promise<AuthSession | undefined>;
}

/** A session is expired once the clock reaches its `expiresAt`, inclusive. */
export function isSessionExpired(session: AuthSession, clock: Clock): boolean {
  return clock.now().getTime() >= session.expiresAt.getTime();
}

/**
 * Whether the current environment may use a non-vendor auth sandbox at all. A dev
 * convenience is never a security boundary, so this is never true in `prod`.
 */
export function isAuthSandboxEligible(finchEnv: string): boolean {
  return finchEnv === 'local' || finchEnv === 'dev' || finchEnv === 'test';
}
