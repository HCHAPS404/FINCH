/**
 * The registry entries must not drift from the implementation: every vector recorded in
 * the registry is recomputed here (README §14.2, §95).
 */
import { describe, expect, it } from 'vitest';

import { decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { getFormula } from '../formula-registry.js';
import { Money } from '../money.js';
import './formulas.js';
import { frenchAmortization } from './french.js';
import { convertRate, parseQuote } from './rate.js';
import { totalCost } from './total-cost.js';
import { usuryCheck } from './usury.js';

function outcome(compute: () => string): string {
  try {
    return compute();
  } catch (error) {
    if (error instanceof FinancialInputError) return error.code;
    throw error;
  }
}

describe('credit formula registry entries', () => {
  it('rate.convert@1 vectors reproduce', () => {
    for (const v of getFormula('rate.convert', 1).testVectors) {
      const { rate = '', from = '', to = '' } = v.inputs;
      expect(
        outcome(() =>
          convertRate(decimal(rate), parseQuote(from), parseQuote(to))
            .toSignificantDigits(34)
            .toFixed(),
        ),
        v.description,
      ).toBe(v.expected);
    }
  });

  it('amortization.french@1 vectors reproduce', () => {
    for (const v of getFormula('amortization.french', 1).testVectors) {
      const { principal = '', currency = '', rate = '', periods = '' } = v.inputs;
      expect(
        outcome(() =>
          frenchAmortization({
            principal: Money.fromMinorUnits(BigInt(principal), currency),
            periodicRate: decimal(rate),
            periods: Number(periods),
          }).instalment.minorUnits.toString(),
        ),
        v.description,
      ).toBe(v.expected);
    }
  });

  it('credit.total_cost@1 vectors reproduce', () => {
    for (const v of getFormula('credit.total_cost', 1).testVectors) {
      const {
        principal = '',
        currency = '',
        rate = '',
        periods = '',
        upfrontCosts = '0',
      } = v.inputs;
      expect(
        outcome(() =>
          totalCost({
            principal: Money.fromMinorUnits(BigInt(principal), currency),
            monthlyRate: decimal(rate),
            periods: Number(periods),
            upfrontCosts: Money.fromMinorUnits(BigInt(upfrontCosts), currency),
          }).totalCost.minorUnits.toString(),
        ),
        v.description,
      ).toBe(v.expected);
    }
  });

  it('credit.usury_check@1 vectors reproduce', () => {
    for (const v of getFormula('credit.usury_check', 1).testVectors) {
      const {
        agreedRateEA = '',
        usuryRateEA = '',
        validFrom = '',
        validTo = '',
        asOf = '',
      } = v.inputs;
      expect(
        outcome(
          () =>
            usuryCheck({
              agreedRateEA: decimal(agreedRateEA),
              usuryRateEA: decimal(usuryRateEA),
              validFrom,
              validTo,
              asOf,
            }).status,
        ),
        v.description,
      ).toBe(v.expected);
    }
  });

  it('records where each implementation lives', () => {
    expect(getFormula('rate.convert', 1).implementationPath).toContain('src/credit/rate.ts');
    expect(getFormula('amortization.french', 1).implementationPath).toContain(
      'src/credit/french.ts',
    );
  });
});
