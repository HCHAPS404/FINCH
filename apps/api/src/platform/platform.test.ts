/**
 * Platform helpers: error mapping, correlation IDs and the rate limiter.
 */
import { ERROR_NAMESPACES, NAMESPACE_HTTP_STATUS, type FinchErrorCode } from '@finch/contracts';
import { describe, expect, it } from 'vitest';

import { resolveCorrelationId } from './correlation.js';
import { statusFor } from './errors.js';
import { FixedWindowLimiter } from './rate-limit.js';

describe('statusFor', () => {
  it.each(ERROR_NAMESPACES)('maps every %s code to its namespace status', (namespace) => {
    const code = `FINCH_${namespace}_SOMETHING` as FinchErrorCode;
    expect(statusFor(code)).toBe(NAMESPACE_HTTP_STATUS[namespace]);
  });

  it('resolves the two-word RATE_LIMIT namespace', () => {
    expect(statusFor('FINCH_RATE_LIMIT_AI_TURNS')).toBe(429);
  });

  it('distinguishes AUTH from AUTHZ', () => {
    expect(statusFor('FINCH_AUTH_EXPIRED')).toBe(401);
    expect(statusFor('FINCH_AUTHZ_DENIED')).toBe(403);
  });
});

describe('resolveCorrelationId', () => {
  it('keeps a safe token and replaces anything else', () => {
    expect(resolveCorrelationId('abc-12345')).toBe('abc-12345');
    expect(resolveCorrelationId(['first-id-1', 'second'])).toBe('first-id-1');
    for (const unsafe of [undefined, 'short', 'x'.repeat(65), 'has space 123', 'a\r\nb-12345']) {
      expect(resolveCorrelationId(unsafe)).toMatch(/^[0-9a-f-]{36}$/);
    }
  });
});

describe('FixedWindowLimiter', () => {
  it('allows up to the limit per window, then refuses with retry-after', () => {
    let now = 0;
    const limiter = new FixedWindowLimiter(2, 60_000, () => now);
    expect(limiter.check('ip').allowed).toBe(true);
    expect(limiter.check('ip').allowed).toBe(true);
    now = 15_000;
    expect(limiter.check('ip')).toEqual({ allowed: false, retryAfterSeconds: 45 });
    expect(limiter.check('other-ip').allowed).toBe(true);
    now = 60_000;
    expect(limiter.check('ip').allowed).toBe(true);
  });
});
