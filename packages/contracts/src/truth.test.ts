/**
 * Truth-class gate tests — README Constitution §4.2, §4.7, §3.3.
 *
 * `canDriveIrreversibleAction` is where two constitutional clauses stop being prose
 * and become code:
 *
 *   §4.2  financial truth does not depend on an LLM
 *   §4.7  an unconfirmed document cannot trigger an irreversible monetary action
 *
 * If this function ever returns true for GENERATED_NARRATIVE or ESTIMATED, a forecast
 * or a sentence written by a language model becomes sufficient grounds to move money.
 * That is the single worst failure this codebase can have, so it is tested
 * exhaustively rather than by example.
 */
import { describe, it, expect } from 'vitest';
import {
  TRUTH_CLASSES,
  canDriveIrreversibleAction,
  isAuthoritative,
  type TruthClass,
} from './truth.js';

describe('truth classes', () => {
  it('enumerates exactly the five classes defined in README §3.3', () => {
    expect([...TRUTH_CLASSES]).toEqual([
      'OBSERVED',
      'USER_ASSERTED',
      'DERIVED_DETERMINISTIC',
      'ESTIMATED',
      'GENERATED_NARRATIVE',
    ]);
  });
});

describe('canDriveIrreversibleAction', () => {
  // Exhaustive: every class is asserted, so adding a sixth class without deciding its
  // actionability breaks this test rather than silently defaulting to permitted.
  const EXPECTED: Record<TruthClass, boolean> = {
    OBSERVED: true,
    DERIVED_DETERMINISTIC: true,
    USER_ASSERTED: false,
    ESTIMATED: false,
    GENERATED_NARRATIVE: false,
  };

  it.each(TRUTH_CLASSES)('%s', (truthClass) => {
    expect(canDriveIrreversibleAction(truthClass)).toBe(EXPECTED[truthClass]);
  });

  it('never lets LLM output authorize money movement (Constitution §4.2)', () => {
    expect(canDriveIrreversibleAction('GENERATED_NARRATIVE')).toBe(false);
    expect(isAuthoritative('GENERATED_NARRATIVE')).toBe(false);
  });

  it('never lets a forecast authorize money movement', () => {
    expect(canDriveIrreversibleAction('ESTIMATED')).toBe(false);
    expect(isAuthoritative('ESTIMATED')).toBe(false);
  });

  it('does not treat a user assertion as verified (Constitution §4.7)', () => {
    // A user-entered balance is trusted enough to plan with, not to pay from.
    expect(canDriveIrreversibleAction('USER_ASSERTED')).toBe(false);
    expect(isAuthoritative('USER_ASSERTED')).toBe(false);
  });

  it('covers every declared class, so a new one cannot default to permitted', () => {
    expect(Object.keys(EXPECTED).sort()).toEqual([...TRUTH_CLASSES].sort());
  });
});

describe('isAuthoritative', () => {
  it('admits only observed facts and deterministic derivations', () => {
    const authoritative = TRUTH_CLASSES.filter((c) => isAuthoritative(c));
    expect([...authoritative].sort()).toEqual(['DERIVED_DETERMINISTIC', 'OBSERVED']);
  });
});
