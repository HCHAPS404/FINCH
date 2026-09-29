/**
 * amortization.french@1 — golden vectors (independent Python reference) and invariants.
 * docs/financial-formulas/colombia-credit.md §2.
 */
import { describe, expect, it } from 'vitest';

import { decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { Money } from '../money.js';
import { frenchAmortization } from './french.js';
import { loadVectors } from '../../test/load-vectors.js';

interface Row {
  period: string;
  payment: string;
  interest: string;
  principal: string;
  balance: string;
}

const file = loadVectors<
  { principal: string; currency: string; rate: string; periods: string },
  {
    instalment?: string;
    lastPayment?: string;
    totalInterest?: string;
    totalPaid?: string;
    schedule?: Row[];
    error?: string;
  }
>('amortization.french@1.json');

function run(inputs: { principal: string; currency: string; rate: string; periods: string }) {
  return frenchAmortization({
    principal: Money.fromMinorUnits(BigInt(inputs.principal), inputs.currency),
    periodicRate: decimal(inputs.rate),
    periods: Number(inputs.periods),
  });
}

describe('amortization.french@1 golden vectors', () => {
  for (const vector of file.vectors) {
    it(vector.description, () => {
      if (vector.expected.error !== undefined) {
        let code = '';
        try {
          run(vector.inputs);
        } catch (error) {
          expect(error).toBeInstanceOf(FinancialInputError);
          code = (error as FinancialInputError).code;
        }
        expect(code).toBe(vector.expected.error);
        return;
      }
      const result = run(vector.inputs);
      const last = result.schedule.at(-1);
      expect(result.instalment.minorUnits.toString()).toBe(vector.expected.instalment);
      expect(last?.payment.minorUnits.toString()).toBe(vector.expected.lastPayment);
      expect(result.totalInterest.minorUnits.toString()).toBe(vector.expected.totalInterest);
      expect(result.totalPaid.minorUnits.toString()).toBe(vector.expected.totalPaid);
      if (vector.expected.schedule !== undefined) {
        expect(
          result.schedule.map((r) => ({
            period: String(r.period),
            payment: r.payment.minorUnits.toString(),
            interest: r.interest.minorUnits.toString(),
            principal: r.principal.minorUnits.toString(),
            balance: r.balance.minorUnits.toString(),
          })),
        ).toEqual(vector.expected.schedule);
      }
    });
  }
});

describe('amortization.french@1 invariants', () => {
  const cases = [
    { principal: 1_000_000_000n, rate: '0.016', periods: 36 },
    { principal: 123_456_789n, rate: '0.0275', periods: 48 },
    { principal: 999n, rate: '0.05', periods: 5 },
    { principal: 50_000_000n, rate: '0', periods: 7 },
  ];

  it('repays exactly the principal and ends at a zero balance', () => {
    for (const c of cases) {
      const result = frenchAmortization({
        principal: Money.fromMinorUnits(c.principal, 'COP'),
        periodicRate: decimal(c.rate),
        periods: c.periods,
      });
      const repaid = result.schedule.reduce((sum, r) => sum + r.principal.minorUnits, 0n);
      expect(repaid).toBe(c.principal);
      expect(result.schedule.at(-1)?.balance.minorUnits).toBe(0n);
      expect(result.totalPaid.minorUnits).toBe(c.principal + result.totalInterest.minorUnits);
    }
  });

  it('a higher rate never lowers total interest (ceteris paribus)', () => {
    let previous = -1n;
    for (const rate of ['0', '0.005', '0.01', '0.016', '0.02', '0.03']) {
      const result = frenchAmortization({
        principal: Money.fromMinorUnits(1_000_000_000n, 'COP'),
        periodicRate: decimal(rate),
        periods: 36,
      });
      expect(result.totalInterest.minorUnits >= previous).toBe(true);
      previous = result.totalInterest.minorUnits;
    }
  });

  it('every payment except the last equals the rounded instalment', () => {
    const result = frenchAmortization({
      principal: Money.fromMinorUnits(1_000_000_000n, 'COP'),
      periodicRate: decimal('0.016'),
      periods: 36,
    });
    for (const row of result.schedule.slice(0, -1)) {
      expect(row.payment.equals(result.instalment)).toBe(true);
    }
  });
});
