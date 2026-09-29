/**
 * credit.usury_check@1 — golden vectors and edge cases.
 * docs/financial-formulas/colombia-credit.md §4.
 */
import { describe, expect, it } from 'vitest';

import { loadVectors } from '../../test/load-vectors.js';
import { decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { usuryCheck, type UsuryCheckInput } from './usury.js';

interface Inputs {
  agreedRateEA: string;
  usuryRateEA: string;
  validFrom: string;
  validTo: string;
  asOf: string;
}

const file = loadVectors<
  Inputs,
  { status?: string; marginPp?: string; sourceStatus?: string; error?: string }
>('credit.usury_check@1.json');

function toInput(v: Inputs): UsuryCheckInput {
  return {
    agreedRateEA: decimal(v.agreedRateEA),
    usuryRateEA: decimal(v.usuryRateEA),
    validFrom: v.validFrom,
    validTo: v.validTo,
    asOf: v.asOf,
  };
}

function errorCode(run: () => unknown): string {
  try {
    run();
  } catch (error) {
    if (error instanceof FinancialInputError) return error.code;
    throw error;
  }
  return 'NO_ERROR';
}

describe('credit.usury_check@1 golden vectors', () => {
  for (const vector of file.vectors) {
    it(vector.description, () => {
      if (vector.expected.error !== undefined) {
        expect(errorCode(() => usuryCheck(toInput(vector.inputs)))).toBe(vector.expected.error);
        return;
      }
      const result = usuryCheck(toInput(vector.inputs));
      expect(result.status).toBe(vector.expected.status);
      expect(result.marginPp.toFixed()).toBe(decimal(vector.expected.marginPp ?? '').toFixed());
      expect(result.sourceStatus).toBe(vector.expected.sourceStatus);
    });
  }
});

describe('credit.usury_check@1 edge cases', () => {
  const valid: UsuryCheckInput = {
    agreedRateEA: decimal('0.2'),
    usuryRateEA: decimal('0.28'),
    validFrom: '2026-10-01',
    validTo: '2026-10-31',
    asOf: '2026-10-15',
  };

  it.each(['2026-02-29', '2026-13-01', '2026-1-01', '15/10/2026', ''])(
    'rejects the non-date %j',
    (asOf) => {
      expect(errorCode(() => usuryCheck({ ...valid, asOf }))).toBe('INVALID_DATE');
    },
  );

  it('accepts 29 February in a leap year', () => {
    expect(usuryCheck({ ...valid, asOf: '2028-02-29' }).sourceStatus).toBe('STALE');
  });

  it('rejects a non-positive usury rate and a negative agreed rate', () => {
    expect(errorCode(() => usuryCheck({ ...valid, usuryRateEA: decimal('0') }))).toBe(
      'RATE_OUT_OF_DOMAIN',
    );
    expect(errorCode(() => usuryCheck({ ...valid, agreedRateEA: decimal('-0.01') }))).toBe(
      'RATE_OUT_OF_DOMAIN',
    );
  });

  it('a date before the window is stale too', () => {
    expect(usuryCheck({ ...valid, asOf: '2026-09-30' }).sourceStatus).toBe('STALE');
  });
});
