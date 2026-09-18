/**
 * Auth session port tests — README §8, §9.
 */
import { describe, it, expect } from 'vitest';
import type { PrincipalId } from '@finch/contracts';
import { fixedClock } from './clock.js';
import { isSessionExpired, isAuthSandboxEligible, type AuthSession } from './auth-session.js';

const principalId = 'principal-1' as PrincipalId;

function sessionExpiringAt(expiresAt: Date): AuthSession {
  return { principalId, issuedAt: new Date('2026-01-01T00:00:00Z'), expiresAt };
}

describe('isSessionExpired', () => {
  it('is not expired before its expiry instant', () => {
    const session = sessionExpiringAt(new Date('2026-01-01T01:00:00Z'));
    const clock = fixedClock(new Date('2026-01-01T00:30:00Z'));
    expect(isSessionExpired(session, clock)).toBe(false);
  });

  it('is expired exactly at its expiry instant', () => {
    const session = sessionExpiringAt(new Date('2026-01-01T01:00:00Z'));
    const clock = fixedClock(new Date('2026-01-01T01:00:00Z'));
    expect(isSessionExpired(session, clock)).toBe(true);
  });

  it('is expired after its expiry instant', () => {
    const session = sessionExpiringAt(new Date('2026-01-01T01:00:00Z'));
    const clock = fixedClock(new Date('2026-01-01T02:00:00Z'));
    expect(isSessionExpired(session, clock)).toBe(true);
  });
});

describe('isAuthSandboxEligible', () => {
  it.each(['local', 'dev', 'test'])('allows the sandbox in %s', (env) => {
    expect(isAuthSandboxEligible(env)).toBe(true);
  });

  it.each(['staging', 'prod', 'integration', ''])('never allows the sandbox in %s', (env) => {
    expect(isAuthSandboxEligible(env)).toBe(false);
  });
});
