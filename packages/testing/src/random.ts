/**
 * Seeded randomness — README §73, §80.
 *
 * "Every factory is deterministic given a seed, so a failure is reproducible" only
 * holds if the randomness underneath it is actually reproducible. `Math.random()` is
 * banned in the pure layers (`packages/domain`, `packages/financial-engine`,
 * `packages/contracts`) for exactly this reason; this package gives test factories a
 * seedable equivalent instead of reaching for it.
 */

export type RandomSource = () => number;

/**
 * mulberry32 — a small, fast, non-cryptographic PRNG. Good enough for generating
 * reproducible test data; never use this for anything security-sensitive.
 */
export function createSeededRandom(seed: number): RandomSource {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A reproducible id, distinct across calls for a given random source. */
export function randomId(random: RandomSource, prefix: string): string {
  const suffix = Math.floor(random() * 1e12).toString(36);
  return `${prefix}-${suffix}`;
}
