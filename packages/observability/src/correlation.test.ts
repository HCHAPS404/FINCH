/**
 * Correlation propagation tests — README §46, §21.2.
 */
import { describe, it, expect } from 'vitest';
import { runWithCorrelation, getCorrelationContext, newCorrelationId } from './correlation.js';

describe('correlation propagation', () => {
  it('is undefined outside any correlation scope', () => {
    expect(getCorrelationContext()).toBeUndefined();
  });

  it('exposes the active context to nested synchronous calls', () => {
    runWithCorrelation({ correlationId: 'corr-1', causationId: null }, () => {
      expect(getCorrelationContext()).toEqual({ correlationId: 'corr-1', causationId: null });
    });
  });

  it('exposes the active context across an async boundary', async () => {
    await runWithCorrelation({ correlationId: 'corr-2', causationId: 'cause-2' }, async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(getCorrelationContext()).toEqual({ correlationId: 'corr-2', causationId: 'cause-2' });
    });
  });

  it('never leaks one scope into a sibling scope', () => {
    runWithCorrelation({ correlationId: 'corr-a', causationId: null }, () => {
      // Scope ends when this callback returns.
    });
    runWithCorrelation({ correlationId: 'corr-b', causationId: null }, () => {
      expect(getCorrelationContext()?.correlationId).toBe('corr-b');
    });
  });

  it('generates a distinct id on each call', () => {
    const a = newCorrelationId();
    const b = newCorrelationId();
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f-]{36}$/);
  });
});
