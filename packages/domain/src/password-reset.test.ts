/**
 * Password reset token expiry tests — ADR-0041.
 */
import { describe, it, expect } from 'vitest';
import { fixedClock } from './clock.js';
import { isResetTokenExpired } from './password-reset.js';

describe('isResetTokenExpired', () => {
  it('is not expired before its expiry instant', () => {
    const clock = fixedClock(new Date('2026-01-01T00:29:00Z'));
    expect(isResetTokenExpired(new Date('2026-01-01T00:30:00Z'), clock)).toBe(false);
  });

  it('is expired exactly at, and after, its expiry instant', () => {
    expect(
      isResetTokenExpired(new Date('2026-01-01T00:30:00Z'), fixedClock(new Date('2026-01-01T00:30:00Z'))),
    ).toBe(true);
    expect(
      isResetTokenExpired(new Date('2026-01-01T00:30:00Z'), fixedClock(new Date('2026-01-01T01:00:00Z'))),
    ).toBe(true);
  });
});
