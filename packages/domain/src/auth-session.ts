/**
 * Auth session port — README §8, §9, ADR-0015, ADR-0041.
 *
 * ADR-0015 (identity provider) is still **Proposed** — no vendor has been chosen. Per
 * ADR-0022, the domain defines the shape a session takes; a vendor-shaped adapter
 * (OIDC, JWT, whatever ADR-0015 eventually settles on) lives at a composition root,
 * never here. `issue()` was originally sandbox-only (ADR-0015 note on Foundation's
 * dev adapter); ADR-0041's real password adapter also needs to issue a session after
 * a successful login, so it is now part of the port both implementations share —
 * this file still stays silent about token/claims formats, that stays adapter detail.
 */
import type { PrincipalId } from '@finch/contracts';
import type { Clock } from './clock.js';

export interface AuthSession {
  readonly principalId: PrincipalId;
  readonly issuedAt: Date;
  readonly expiresAt: Date;
}

export interface AuthSessionPort {
  issue(principalId: PrincipalId): string;
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
