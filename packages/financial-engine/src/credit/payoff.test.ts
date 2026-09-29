/**
 * debt.payoff_plan@1 — golden vectors (independent Python reference) and invariants.
 * docs/financial-formulas/colombia-credit.md §6.
 */
import { describe, expect, it } from 'vitest';

import { loadVectors } from '../../test/load-vectors.js';
import { decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { Money } from '../money.js';
import { payoffPlan, type PayoffPlanInput, type PayoffStrategyResult } from './payoff.js';

interface Inputs {
  currency: string;
  extra: string;
  debts: { id: string; balance: string; rate: string; minimum: string }[];
}

interface StrategyExpected {
  monthsToDebtFree: string;
  totalInterest: string;
  totalPaid: string;
  payoffOrder: { id: string; month: string }[];
}

const file = loadVectors<
  Inputs,
  { AVALANCHE?: StrategyExpected; SNOWBALL?: StrategyExpected; error?: string }
>('debt.payoff_plan@1.json');

function toInput(v: Inputs): PayoffPlanInput {
  return {
    extra: Money.fromMinorUnits(BigInt(v.extra), v.currency),
    debts: v.debts.map((d) => ({
      id: d.id,
      balance: Money.fromMinorUnits(BigInt(d.balance), v.currency),
      monthlyRate: decimal(d.rate),
      minimumPayment: Money.fromMinorUnits(BigInt(d.minimum), v.currency),
    })),
  };
}

function encode(r: PayoffStrategyResult): StrategyExpected {
  return {
    monthsToDebtFree: String(r.monthsToDebtFree),
    totalInterest: r.totalInterest.minorUnits.toString(),
    totalPaid: r.totalPaid.minorUnits.toString(),
    payoffOrder: r.payoffOrder.map((o) => ({ id: o.id, month: String(o.month) })),
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

describe('debt.payoff_plan@1 golden vectors', () => {
  for (const vector of file.vectors) {
    it(vector.description, () => {
      if (vector.expected.error !== undefined) {
        expect(errorCode(() => payoffPlan(toInput(vector.inputs)))).toBe(vector.expected.error);
        return;
      }
      const r = payoffPlan(toInput(vector.inputs));
      expect(encode(r.AVALANCHE)).toEqual(vector.expected.AVALANCHE);
      expect(encode(r.SNOWBALL)).toEqual(vector.expected.SNOWBALL);
    });
  }
});

describe('debt.payoff_plan@1 invariants', () => {
  const input: PayoffPlanInput = toInput({
    currency: 'COP',
    extra: '40000000',
    debts: [
      { id: 'a', balance: '450000000', rate: '0.028', minimum: '18000000' },
      { id: 'b', balance: '120000000', rate: '0.021', minimum: '6000000' },
      { id: 'c', balance: '900000000', rate: '0.014', minimum: '30000000' },
    ],
  });

  it('total paid equals principal plus interest for both strategies', () => {
    const principal = input.debts.reduce((s, d) => s + d.balance.minorUnits, 0n);
    const r = payoffPlan(input);
    for (const s of [r.AVALANCHE, r.SNOWBALL]) {
      expect(s.totalPaid.minorUnits).toBe(principal + s.totalInterest.minorUnits);
      expect(s.payoffOrder.map((o) => o.id).sort()).toEqual(['a', 'b', 'c']);
    }
  });

  it('avalanche never pays more interest than snowball', () => {
    const r = payoffPlan(input);
    expect(r.AVALANCHE.totalInterest.minorUnits <= r.SNOWBALL.totalInterest.minorUnits).toBe(true);
  });

  it('a larger extra never lengthens the plan nor raises interest', () => {
    const more = payoffPlan({ ...input, extra: Money.fromMinorUnits(80_000_000n, 'COP') });
    const base = payoffPlan(input);
    expect(more.AVALANCHE.monthsToDebtFree).toBeLessThanOrEqual(base.AVALANCHE.monthsToDebtFree);
    expect(more.AVALANCHE.totalInterest.minorUnits <= base.AVALANCHE.totalInterest.minorUnits).toBe(
      true,
    );
  });

  it('rejects an empty list, repeated ids and empty balances', () => {
    const one = input.debts[0]!;
    expect(errorCode(() => payoffPlan({ ...input, debts: [] }))).toBe('INVALID_DEBT');
    expect(errorCode(() => payoffPlan({ ...input, debts: [one, one] }))).toBe('INVALID_DEBT');
    expect(
      errorCode(() => payoffPlan({ ...input, debts: [{ ...one, balance: Money.zero('COP') }] })),
    ).toBe('INVALID_DEBT');
  });
});
