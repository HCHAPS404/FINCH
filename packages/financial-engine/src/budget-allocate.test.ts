/**
 * `budget.allocate@1` tests — golden vectors per
 * docs/financial-formulas/personal-finance.md "Vectores mínimos" (nominal, borde,
 * conservación, error explicativo), plus a conservation sweep across varied inputs.
 */
import { describe, it, expect } from 'vitest';
import { Money } from './money.js';
import { allocateBudget, type BudgetAllocateInput } from './budget-allocate.js';

const COP = 'COP';
const cop = (amount: string): Money => Money.fromDecimalString(amount, COP);

function sumAllocations(result: ReturnType<typeof allocateBudget>): Money {
  return result.allocations.reduce((total, line) => total.add(line.amount), Money.zero(COP));
}

function baseInput(overrides: Partial<BudgetAllocateInput> = {}): BudgetAllocateInput {
  return {
    income: cop('3000000'),
    nextIncomeDate: '2026-11-15',
    obligations: [],
    debts: [],
    emergencyFundTarget: cop('0'),
    emergencyFundCurrent: cop('0'),
    emergencyFundCapPerCycle: cop('0'),
    goals: [],
    rule: { type: 'CUSTOM' },
    surplusStrategy: 'SAVE',
    roundingMode: 'HALF_DOWN',
    ...overrides,
  };
}

describe('allocateBudget — golden vectors (personal-finance.md §1)', () => {
  it('nominal: obligation, debt minimum, pay-yourself-first, emergency fund, goal, surplus', () => {
    const input = baseInput({
      income: cop('3000000'),
      obligations: [{ name: 'Arriendo', amount: cop('1000000'), dueDate: '2026-11-05' }],
      debts: [
        {
          name: 'Tarjeta Visa',
          minimumPayment: cop('150000'),
          dueDate: '2026-11-10',
          interestRateBps: 3600,
        },
      ],
      emergencyFundTarget: cop('5000000'),
      emergencyFundCurrent: cop('4900000'),
      emergencyFundCapPerCycle: cop('200000'),
      goals: [
        {
          name: 'Vacaciones',
          priority: 1,
          targetDate: '2027-06-01',
          suggestedContribution: cop('100000'),
        },
      ],
      rule: { type: 'PAY_YOURSELF_FIRST', numerator: 10n, denominator: 100n },
      surplusStrategy: 'DEBT_AVALANCHE',
    });

    const result = allocateBudget(input);

    expect(result.deficit).toBeUndefined();
    const byLayer = Object.fromEntries(result.allocations.map((a) => [a.layer, a]));
    expect(byLayer['OBLIGATION']?.amount.toDecimalString()).toBe('1000000.00');
    expect(byLayer['DEBT_MINIMUM']?.amount.toDecimalString()).toBe('150000.00');
    expect(byLayer['PAY_YOURSELF_FIRST']?.amount.toDecimalString()).toBe('300000.00'); // 10% of 3,000,000
    expect(byLayer['EMERGENCY_FUND']?.amount.toDecimalString()).toBe('100000.00'); // gap 100k < cap 200k
    expect(byLayer['GOAL']?.amount.toDecimalString()).toBe('100000.00');
    // Remaining after layers 1-5: 3,000,000 - 1,000,000 - 150,000 - 300,000 - 100,000 - 100,000 = 1,350,000
    expect(byLayer['SURPLUS']?.amount.toDecimalString()).toBe('1350000.00');
    expect(byLayer['SURPLUS']?.destination).toBe('Tarjeta Visa');
    expect(result.free.toDecimalString()).toBe('0.00');
    expect(sumAllocations(result).add(result.free).equals(input.income)).toBe(true);
  });

  it('borde: no obligations, debts or goals under CUSTOM — everything is free', () => {
    const input = baseInput({ income: cop('1234.56') });

    const result = allocateBudget(input);

    expect(result.allocations).toHaveLength(0);
    expect(result.free.toDecimalString()).toBe('1234.56');
    expect(result.deficit).toBeUndefined();
  });

  it('borde: a single obligation consumes the entire income exactly', () => {
    const input = baseInput({
      income: cop('500000'),
      obligations: [{ name: 'Arriendo', amount: cop('500000'), dueDate: '2026-11-01' }],
    });

    const result = allocateBudget(input);

    expect(result.allocations).toHaveLength(1);
    expect(result.free.toDecimalString()).toBe('0.00');
    expect(result.deficit).toBeUndefined();
  });

  it('conservación: a non-evenly-divisible pay-yourself-first ratio still conserves the total', () => {
    const input = baseInput({
      income: cop('1000001'), // odd minor-unit total so 10% does not divide evenly
      rule: { type: 'PAY_YOURSELF_FIRST', numerator: 1n, denominator: 3n },
      roundingMode: 'HALF_EVEN',
      goals: [
        {
          name: 'Meta A',
          priority: 1,
          targetDate: '2027-01-01',
          suggestedContribution: cop('999999999'),
        },
      ],
    });

    const result = allocateBudget(input);

    expect(sumAllocations(result).add(result.free).equals(input.income)).toBe(true);
    expect(result.free.toDecimalString()).toBe('0.00'); // the oversized goal soaks up everything left
  });

  it('error explicativo: deficit when obligations and debt minimums alone exceed income', () => {
    const input = baseInput({
      income: cop('100000'),
      obligations: [{ name: 'Arriendo', amount: cop('80000'), dueDate: '2026-11-01' }],
      debts: [{ name: 'Tarjeta', minimumPayment: cop('50000'), dueDate: '2026-11-02' }],
      rule: { type: 'PAY_YOURSELF_FIRST', numerator: 1n, denominator: 10n },
      goals: [
        { name: 'Meta', priority: 1, targetDate: '2027-01-01', suggestedContribution: cop('1000') },
      ],
    });

    const result = allocateBudget(input);

    expect(result.allocations).toHaveLength(2); // only layers 1-2; everything else skipped
    expect(result.free.toDecimalString()).toBe('-30000.00');
    expect(result.deficit?.toDecimalString()).toBe('30000.00');
    expect(sumAllocations(result).add(result.free).equals(input.income)).toBe(true);
  });

  it('error explicativo: throws a clear error for a non-positive income', () => {
    const input = baseInput({ income: cop('0') });

    expect(() => allocateBudget(input)).toThrow(/positive income/);
  });
});

describe('allocateBudget — conservation holds across varied inputs', () => {
  const scenarios: readonly BudgetAllocateInput[] = [
    baseInput({ income: cop('1') }),
    baseInput({
      income: cop('7777777'),
      rule: { type: 'RULE_50_30_20' },
      goals: [
        { name: 'A', priority: 2, targetDate: '2027-03-01', suggestedContribution: cop('1000000') },
        { name: 'B', priority: 1, targetDate: '2027-01-01', suggestedContribution: cop('500000') },
      ],
      emergencyFundTarget: cop('2000000'),
      emergencyFundCurrent: cop('0'),
      emergencyFundCapPerCycle: cop('300000'),
      surplusStrategy: 'DEBT_AVALANCHE',
      debts: [
        {
          name: 'Libranza',
          minimumPayment: cop('0'),
          dueDate: '2026-12-01',
          interestRateBps: 1800,
        },
      ],
    }),
    baseInput({
      income: cop('50000'),
      obligations: [{ name: 'Suscripción', amount: cop('49999'), dueDate: '2026-11-01' }],
      rule: { type: 'PAY_YOURSELF_FIRST', numerator: 5n, denominator: 7n },
    }),
    baseInput({
      income: cop('999999999999'),
      goals: Array.from({ length: 5 }, (_, i) => ({
        name: `Meta ${i}`,
        priority: i,
        targetDate: '2027-01-01',
        suggestedContribution: cop('1000000'),
      })),
    }),
  ];

  it.each(scenarios.map((input, i) => [i, input] as const))(
    'scenario %i: sum(allocations) + free === income',
    (_i, input) => {
      const result = allocateBudget(input);
      expect(sumAllocations(result).add(result.free).equals(input.income)).toBe(true);
    },
  );
});
