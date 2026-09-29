/**
 * rate.convert@1 — golden vectors (independent Python reference) and invariants.
 * docs/financial-formulas/colombia-credit.md §1.
 */
import { describe, expect, it } from 'vitest';

import { decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { convertRate, QUOTES, parseQuote } from './rate.js';
import { loadVectors } from '../../test/load-vectors.js';

const file = loadVectors<
  { rate: string; from: string; to: string },
  { rate?: string; error?: string }
>('rate.convert@1.json');

describe('rate.convert@1 golden vectors', () => {
  it('uses the independently generated file', () => {
    expect(file.formulaId).toBe('rate.convert');
    expect(file.vectors.length).toBeGreaterThanOrEqual(12);
  });

  for (const vector of file.vectors) {
    it(vector.description, () => {
      const run = () =>
        convertRate(
          decimal(vector.inputs.rate),
          parseQuote(vector.inputs.from),
          parseQuote(vector.inputs.to),
        );
      if (vector.expected.error !== undefined) {
        expect(run).toThrow(FinancialInputError);
        try {
          run();
        } catch (error) {
          expect((error as FinancialInputError).code).toBe(vector.expected.error);
        }
        return;
      }
      // Compared at 34 significant digits: the reference computes at 60, the engine at 40.
      expect(run().toSignificantDigits(34).toFixed()).toBe(
        decimal(vector.expected.rate ?? 'missing').toFixed(),
      );
    });
  }
});

describe('rate.convert@1 invariants', () => {
  const sample = ['0', '0.001', '0.0185', '0.023', '0.05', '0.3', '1.5'];

  it('round-trips through effective annual for every supported quote', () => {
    for (const quote of Object.values(QUOTES)) {
      for (const value of sample) {
        const rate = decimal(value);
        if (
          quote.timing === 'ADVANCE' &&
          !rate.lessThan(quote.basis === 'NOMINAL' ? quote.periodsPerYear : 1)
        ) {
          continue;
        }
        const annual = convertRate(rate, quote, QUOTES.EA);
        const back = convertRate(annual, QUOTES.EA, quote);
        expect(back.minus(rate).abs().lessThan('1e-30')).toBe(true);
      }
    }
  });

  it('never lowers the effective annual rate when the periodic rate rises', () => {
    let previous = decimal('-1');
    for (const value of sample) {
      const annual = convertRate(decimal(value), QUOTES.MV, QUOTES.EA);
      expect(annual.greaterThan(previous)).toBe(true);
      previous = annual;
    }
  });

  it('compounds: EA ≥ nominal annual for the same periodic rate', () => {
    for (const value of sample) {
      const monthly = decimal(value);
      const ea = convertRate(monthly, QUOTES.MV, QUOTES.EA);
      const nominal = convertRate(monthly, QUOTES.MV, QUOTES.NAMV);
      expect(ea.greaterThanOrEqualTo(nominal)).toBe(true);
    }
  });
});

describe('parseQuote', () => {
  it('accepts named Colombian quotes and the explicit form', () => {
    expect(parseQuote('MV')).toEqual(QUOTES.MV);
    expect(parseQuote('NOMINAL/12/ARREARS')).toEqual(QUOTES.NAMV);
  });

  it.each(['', 'MV/12', 'EFFECTIVE/0/ARREARS', 'EFFECTIVE/12/LATER', 'GROSS/12/ARREARS'])(
    'rejects %j',
    (text) => {
      expect(() => parseQuote(text)).toThrow(FinancialInputError);
    },
  );
});
