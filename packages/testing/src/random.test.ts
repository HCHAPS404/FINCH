/**
 * Seeded randomness tests — README §73, §80.
 */
import { describe, it, expect } from 'vitest';
import { createSeededRandom, randomId } from './random.js';

describe('createSeededRandom', () => {
  it('produces the same sequence for the same seed', () => {
    const a = createSeededRandom(42);
    const b = createSeededRandom(42);
    const sequenceA = Array.from({ length: 5 }, () => a());
    const sequenceB = Array.from({ length: 5 }, () => b());
    expect(sequenceA).toEqual(sequenceB);
  });

  it('produces a different sequence for a different seed', () => {
    const a = createSeededRandom(1);
    const b = createSeededRandom(2);
    expect(a()).not.toBe(b());
  });

  it('stays within [0, 1)', () => {
    const random = createSeededRandom(7);
    for (let i = 0; i < 100; i += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('randomId', () => {
  it('is reproducible for a fixed seed', () => {
    expect(randomId(createSeededRandom(9), 'persona')).toBe(
      randomId(createSeededRandom(9), 'persona'),
    );
  });

  it('carries the given prefix', () => {
    expect(randomId(createSeededRandom(9), 'persona')).toMatch(/^persona-/);
  });

  it('differs across successive calls from the same source', () => {
    const random = createSeededRandom(9);
    expect(randomId(random, 'a')).not.toBe(randomId(random, 'a'));
  });
});
