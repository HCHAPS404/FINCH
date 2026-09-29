/**
 * credit.compare_refinance@1 — golden vectors (independent Python reference) and invariants.
 * docs/financial-formulas/colombia-credit.md §5.
 */
import type { TruthClass } from '@finch/contracts';
import { describe, expect, it } from 'vitest';

import { loadVectors } from '../../test/load-vectors.js';
import { decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { Money } from '../money.js';
import { compareRefinance, type CompareRefinanceInput } from './refinance.js';

interface Inputs {
  balance: string;
  currency: string;
  currentRate: string;
  currentPeriods: string;
  currentCharges: string;
  offerRate: string;
  offerPeriods: string;
  offerCharges: string;
  switchingCosts: string;
  opportunityRate: string;
  currentTruth: TruthClass;
  opportunityRateTruth: TruthClass;
}

type MoneyField =
  | 'currentInstalment'
  | 'offerInstalment'
  | 'instalmentDelta'
  | 'totalCurrent'
  | 'totalOffer'
  | 'nominalSavings'
  | 'pvSavings';

type Expected = Record<MoneyField | 'breakEvenMonth' | 'longerTermAlert' | 'truthClass', string>;

const MONEY_FIELDS: readonly MoneyField[] = [
  'currentInstalment',
  'offerInstalment',
  'instalmentDelta',
  'totalCurrent',
  'totalOffer',
  'nominalSavings',
  'pvSavings',
];

const file = loadVectors<Inputs, Expected>('credit.compare_refinance@1.json');

function toInput(v: Inputs): CompareRefinanceInput {
  const money = (value: string): Money => Money.fromMinorUnits(BigInt(value), v.currency);
  return {
    balance: money(v.balance),
    current: {
      monthlyRate: decimal(v.currentRate),
      periods: Number(v.currentPeriods),
      monthlyCharges: money(v.currentCharges),
    },
    offer: {
      monthlyRate: decimal(v.offerRate),
      periods: Number(v.offerPeriods),
      monthlyCharges: money(v.offerCharges),
    },
    switchingCosts: money(v.switchingCosts),
    opportunityRate: decimal(v.opportunityRate),
    inputTruth: [v.currentTruth, v.opportunityRateTruth],
  };
}

describe('credit.compare_refinance@1 golden vectors', () => {
  it('meets the spec minimum of 6 cases', () => {
    expect(file.vectors.length).toBeGreaterThanOrEqual(6);
  });

  for (const vector of file.vectors) {
    it(vector.description, () => {
      const r = compareRefinance(toInput(vector.inputs));
      for (const field of MONEY_FIELDS) {
        expect(r[field].minorUnits.toString(), field).toBe(vector.expected[field]);
      }
      expect(r.breakEvenMonth === null ? 'none' : String(r.breakEvenMonth)).toBe(
        vector.expected.breakEvenMonth,
      );
      expect(String(r.longerTermAlert)).toBe(vector.expected.longerTermAlert);
      expect(r.truthClass).toBe(vector.expected.truthClass);
    });
  }
});

describe('credit.compare_refinance@1 invariants', () => {
  const base: CompareRefinanceInput = {
    balance: Money.fromMinorUnits(500_000_000n, 'COP'),
    current: { monthlyRate: decimal('0.02'), periods: 24 },
    offer: { monthlyRate: decimal('0.02'), periods: 24 },
    opportunityRate: decimal('0.008'),
    inputTruth: ['OBSERVED'],
  };

  it('an identical offer with no switching costs saves exactly nothing', () => {
    const r = compareRefinance(base);
    expect(r.nominalSavings.minorUnits).toBe(0n);
    expect(r.pvSavings.minorUnits).toBe(0n);
    expect(r.breakEvenMonth).toBe(1);
    expect(r.longerTermAlert).toBe(false);
  });

  it('switching costs reduce nominal savings one for one', () => {
    const without = compareRefinance({
      ...base,
      offer: { ...base.offer, monthlyRate: decimal('0.015') },
    });
    const withCosts = compareRefinance({
      ...base,
      offer: { ...base.offer, monthlyRate: decimal('0.015') },
      switchingCosts: Money.fromMinorUnits(7_000_000n, 'COP'),
    });
    expect(without.nominalSavings.minorUnits - withCosts.nominalSavings.minorUnits).toBe(
      7_000_000n,
    );
  });

  it('refuses model-generated inputs and negative switching costs', () => {
    expect(() => compareRefinance({ ...base, inputTruth: ['GENERATED_NARRATIVE'] })).toThrow(
      FinancialInputError,
    );
    expect(() =>
      compareRefinance({ ...base, switchingCosts: Money.fromMinorUnits(-1n, 'COP') }),
    ).toThrow(FinancialInputError);
  });
});
