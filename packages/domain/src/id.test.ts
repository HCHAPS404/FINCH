/**
 * Id generator tests — README §60.
 */
import { describe, it, expect } from 'vitest';
import { sequentialIdGenerator } from './id.js';

describe('sequentialIdGenerator', () => {
  it('is deterministic and advances per prefix independently', () => {
    const gen = sequentialIdGenerator();
    expect(gen.next('debt')).toBe('debt-1');
    expect(gen.next('debt')).toBe('debt-2');
    expect(gen.next('card')).toBe('card-1');
  });
});
