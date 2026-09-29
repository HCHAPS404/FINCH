/**
 * credit.total_cost@1 — golden vectors (independent Python reference, IRR by Newton's
 * method) and invariants. docs/financial-formulas/colombia-credit.md §3.
 */
import { describe, expect, it } from 'vitest';

import { loadVectors } from '../../test/load-vectors.js';
import { decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { CurrencyMismatchError, Money } from '../money.js';
import {
  solveMonthlyIrr,
  totalCost,
  type InsuranceSpec,
  type TotalCostInput,
} from './total-cost.js';

interface Inputs {
  principal: string;
  currency: string;
  rate: string;
  periods: string;
  upfrontCosts: string;
  insuranceBasis: 'NONE' | 'OUTSTANDING' | 'ORIGINAL' | 'FIXED';
  insuranceRate?: string;
  insuranceAmount?: string;
  handlingFee: string;
  otherCharges: string;
  gmfRate: string;
}

type MoneyField =
  | 'instalment'
  | 'netDisbursement'
  | 'totalPaid'
  | 'totalInterest'
  | 'totalInsurance'
  | 'totalFees'
  | 'totalGmf'
  | 'upfrontCosts'
  | 'totalCost';

type Expected = Partial<
  Record<MoneyField | 'monthlyIrr' | 'effectiveAnnualRate' | 'error', string>
>;

const file = loadVectors<Inputs, Expected>('credit.total_cost@1.json');

function toInput(v: Inputs): TotalCostInput {
  const money = (value: string): Money => Money.fromMinorUnits(BigInt(value), v.currency);
  let insurance: InsuranceSpec;
  switch (v.insuranceBasis) {
    case 'NONE':
      insurance = { basis: 'NONE' };
      break;
    case 'OUTSTANDING':
    case 'ORIGINAL':
      insurance = { basis: v.insuranceBasis, rate: decimal(v.insuranceRate ?? '') };
      break;
    case 'FIXED':
      insurance = { basis: 'FIXED', amount: money(v.insuranceAmount ?? '') };
      break;
  }
  return {
    principal: money(v.principal),
    monthlyRate: decimal(v.rate),
    periods: Number(v.periods),
    upfrontCosts: money(v.upfrontCosts),
    insurance,
    handlingFee: money(v.handlingFee),
    otherCharges: money(v.otherCharges),
    gmfRate: decimal(v.gmfRate),
  };
}

const MONEY_FIELDS = [
  'instalment',
  'netDisbursement',
  'totalPaid',
  'totalInterest',
  'totalInsurance',
  'totalFees',
  'totalGmf',
  'upfrontCosts',
  'totalCost',
] as const satisfies readonly MoneyField[];

describe('credit.total_cost@1 golden vectors', () => {
  it('meets the spec minimum of 6 cases plus errors', () => {
    expect(
      file.vectors.filter((v) => v.expected.error === undefined).length,
    ).toBeGreaterThanOrEqual(6);
  });

  for (const vector of file.vectors) {
    it(vector.description, () => {
      const { error } = vector.expected;
      if (error !== undefined) {
        let code = '';
        try {
          totalCost(toInput(vector.inputs));
        } catch (caught) {
          expect(caught).toBeInstanceOf(FinancialInputError);
          code = (caught as FinancialInputError).code;
        }
        expect(code).toBe(error);
        return;
      }
      const result = totalCost(toInput(vector.inputs));
      for (const field of MONEY_FIELDS) {
        expect(result[field].minorUnits.toString(), field).toBe(vector.expected[field]);
      }
      const irr = decimal(vector.expected.monthlyIrr ?? '');
      const ea = decimal(vector.expected.effectiveAnnualRate ?? '');
      expect(result.monthlyIrr.minus(irr).abs().lessThan('0.00000000001')).toBe(true);
      expect(result.effectiveAnnualRate.minus(ea).abs().lessThan('0.000000001')).toBe(true);
    });
  }
});

describe('credit.total_cost@1 invariants', () => {
  const base: TotalCostInput = {
    principal: Money.fromMinorUnits(1_000_000_000n, 'COP'),
    monthlyRate: decimal('0.016'),
    periods: 36,
  };

  it('outflows add up to the total paid, and the cost decomposes exactly', () => {
    const r = totalCost({
      ...base,
      upfrontCosts: Money.fromMinorUnits(5_000_000n, 'COP'),
      insurance: { basis: 'OUTSTANDING', rate: decimal('0.001') },
      handlingFee: Money.fromMinorUnits(900_000n, 'COP'),
      gmfRate: decimal('0.004'),
    });
    const sum = r.outflows.reduce((acc, m) => acc + m.minorUnits, 0n);
    expect(sum).toBe(r.totalPaid.minorUnits);
    expect(r.totalCost.minorUnits).toBe(
      r.totalInterest.minorUnits +
        r.totalInsurance.minorUnits +
        r.totalFees.minorUnits +
        r.totalGmf.minorUnits +
        r.upfrontCosts.minorUnits,
    );
  });

  it('any added charge never lowers the real rate', () => {
    const plain = totalCost(base).effectiveAnnualRate;
    const variants: TotalCostInput[] = [
      { ...base, upfrontCosts: Money.fromMinorUnits(1n, 'COP') },
      { ...base, handlingFee: Money.fromMinorUnits(100_000n, 'COP') },
      { ...base, insurance: { basis: 'ORIGINAL', rate: decimal('0.0005') } },
      { ...base, gmfRate: decimal('0.004') },
    ];
    for (const variant of variants) {
      expect(totalCost(variant).effectiveAnnualRate.greaterThanOrEqualTo(plain)).toBe(true);
    }
  });

  it('with no charges the real rate is the loan rate, up to minor-unit rounding', () => {
    const r = totalCost(base);
    expect(r.monthlyIrr.minus('0.016').abs().lessThan('0.000001')).toBe(true);
  });

  it('a zero-rate loan with no charges has a zero IRR exactly', () => {
    const r = totalCost({ ...base, monthlyRate: decimal('0') });
    expect(r.monthlyIrr.isZero()).toBe(true);
    expect(r.effectiveAnnualRate.isZero()).toBe(true);
  });

  it('refuses charges in another currency', () => {
    expect(() => totalCost({ ...base, handlingFee: Money.fromMinorUnits(1n, 'USD') })).toThrow(
      CurrencyMismatchError,
    );
  });

  it('refuses negative charges and negative insurance rates', () => {
    for (const input of [
      { ...base, handlingFee: Money.fromMinorUnits(-1n, 'COP') },
      { ...base, insurance: { basis: 'FIXED', amount: Money.fromMinorUnits(-1n, 'COP') } },
      { ...base, insurance: { basis: 'OUTSTANDING', rate: decimal('-0.001') } },
    ] satisfies TotalCostInput[]) {
      expect(() => totalCost(input)).toThrow(FinancialInputError);
    }
  });
});

describe('solveMonthlyIrr', () => {
  it('finds a rate far above 100 % monthly by widening the bracket', () => {
    // Receive 100, pay 400 after one month: r = 3 exactly.
    const r = solveMonthlyIrr(decimal('100'), [decimal('400')]);
    expect(r.minus('3').abs().lessThan('0.000000000001')).toBe(true);
  });

  it('refuses flows that pay back less than was received', () => {
    expect(() => solveMonthlyIrr(decimal('100'), [decimal('50')])).toThrow(FinancialInputError);
  });
});
