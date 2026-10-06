import { describe, it, expect } from 'vitest';
import { cls, cx } from './cx.js';

describe('cx', () => {
  it('joins truthy class names and drops falsy ones', () => {
    expect(cx('a', false, undefined, null, 'b')).toBe('a b');
  });

  it('returns an empty string when nothing is truthy', () => {
    expect(cx(false, undefined, null)).toBe('');
  });
});

describe('cls', () => {
  it('looks up a declared class', () => {
    expect(cls({ card: '_card_abc123' }, 'card')).toBe('_card_abc123');
  });

  it('throws on a missing class instead of returning undefined', () => {
    expect(() => cls({ card: '_card_abc123' }, 'missing')).toThrow(
      'Missing CSS module class "missing"',
    );
  });
});
