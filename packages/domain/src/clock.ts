/**
 * Clock port — README §60.
 *
 * The domain never reads ambient time. `Date.now()` inside a calculation makes that
 * calculation irreproducible, which directly violates Constitution §4.5 ("every
 * historical decision must be reproducible"). It also makes tests depend on when
 * they run, which is how date-boundary defects reach production.
 *
 * The ESLint rule `no-restricted-properties` in @finch/eslint-config blocks Date.now
 * in pure layers, so this port is the only way to obtain the current time.
 */

export interface Clock {
  now(): Date;
}

/** The real clock. Wired in at the composition root, never imported by the domain. */
export const systemClock: Clock = {
  now: () => new Date(),
};

/** Deterministic clock for tests and for replaying a historical decision. */
export function fixedClock(instant: Date): Clock {
  return { now: () => new Date(instant.getTime()) };
}
