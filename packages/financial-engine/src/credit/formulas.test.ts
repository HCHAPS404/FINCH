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
import { payoffPlan } from './payoff.js';
import { convertRate, parseQuote } from './rate.js';
import { compareRefinance } from './refinance.js';
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

  it('credit.compare_refinance@1 vectors reproduce', () => {
    for (const v of getFormula('credit.compare_refinance', 1).testVectors) {
      const {
        balance = '',
        currency = '',
        currentRate = '',
        currentPeriods = '',
        offerRate = '',
        offerPeriods = '',
        switchingCosts = '',
        opportunityRate = '',
      } = v.inputs;
      const money = (value: string): Money => Money.fromMinorUnits(BigInt(value), currency);
      expect(
        outcome(() =>
          compareRefinance({
            balance: money(balance),
            current: { monthlyRate: decimal(currentRate), periods: Number(currentPeriods) },
            offer: { monthlyRate: decimal(offerRate), periods: Number(offerPeriods) },
            switchingCosts: money(switchingCosts),
            opportunityRate: decimal(opportunityRate),
            inputTruth: ['OBSERVED'],
          }).nominalSavings.minorUnits.toString(),
        ),
        v.description,
      ).toBe(v.expected);
    }
  });

  it('debt.payoff_plan@1 vectors reproduce', () => {
    for (const v of getFormula('debt.payoff_plan', 1).testVectors) {
      const { currency = '', extra = '', strategy = '', debts = '' } = v.inputs;
      expect(strategy === 'AVALANCHE' || strategy === 'SNOWBALL').toBe(true);
      expect(
        outcome(() => {
          const plan = payoffPlan({
            extra: Money.fromMinorUnits(BigInt(extra), currency),
            debts: debts.split(';').map((entry) => {
              const [id = '', balance = '', rate = '', minimum = ''] = entry.split(':');
              return {
                id,
                balance: Money.fromMinorUnits(BigInt(balance), currency),
                monthlyRate: decimal(rate),
                minimumPayment: Money.fromMinorUnits(BigInt(minimum), currency),
              };
            }),
          });
          const result = strategy === 'SNOWBALL' ? plan.SNOWBALL : plan.AVALANCHE;
          return result.totalInterest.minorUnits.toString();
        }),
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
