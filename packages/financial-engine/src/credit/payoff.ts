/**
 * debt.payoff_plan@1 — month-by-month payoff simulation, AVALANCHE and SNOWBALL.
 * Spec: docs/financial-formulas/colombia-credit.md §6.
 *
 * Constant monthly budget B = Σ minimum payments + extra. Each month:
 *   1. interest accrues on every open debt, rounded HALF_EVEN per debt;
 *   2. each open debt receives its minimum (capped at its balance);
 *   3. the rest of B goes to the priority debt, cascading when a debt is cleared.
 * Minimums of cleared debts therefore roll into the surplus. Priority: AVALANCHE, the
 * highest monthly rate first; SNOWBALL, the smallest current balance first; ties keep
 * the input order. Both strategies are always returned so FINCH never hides the
 * alternative (spec §6).
 */
import { type Decimal, decimal, roundDecimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { CurrencyMismatchError, Money } from '../money.js';

export const PAYOFF_STRATEGIES = ['AVALANCHE', 'SNOWBALL'] as const;
export type PayoffStrategy = (typeof PAYOFF_STRATEGIES)[number];

/** Simulation horizon: 100 years of months. */
export const MAX_PAYOFF_MONTHS = 1200;

export interface PayoffDebt {
  /** Caller-chosen identifier, unique within the plan (never PII). */
  readonly id: string;
  readonly balance: Money;
  /** Effective monthly rate. */
  readonly monthlyRate: Decimal;
  readonly minimumPayment: Money;
}

export interface PayoffPlanInput {
  readonly debts: readonly PayoffDebt[];
  /** Monthly surplus on top of the minimum payments. */
  readonly extra: Money;
}

export interface PayoffStrategyResult {
  readonly monthsToDebtFree: number;
  readonly totalInterest: Money;
  readonly totalPaid: Money;
  /** Debts in the order they are cleared; same-month ties keep the input order. */
  readonly payoffOrder: readonly { readonly id: string; readonly month: number }[];
}

export interface PayoffPlanResult {
  readonly formula: { readonly formulaId: 'debt.payoff_plan'; readonly version: 1 };
  readonly AVALANCHE: PayoffStrategyResult;
  readonly SNOWBALL: PayoffStrategyResult;
}

function interestOn(balance: bigint, rate: Decimal): bigint {
  return BigInt(roundDecimal(decimal(balance).times(rate), 0, 'HALF_EVEN').toFixed(0));
}

function invalidDebt(message: string): FinancialInputError {
  return new FinancialInputError('INVALID_DEBT', message);
}

function validate(input: PayoffPlanInput): string {
  const first = input.debts[0];
  if (first === undefined) throw invalidDebt('A payoff plan needs at least one debt.');
  const code = first.balance.currency.code;
  const ids = new Set<string>();
  for (const debt of input.debts) {
    for (const amount of [debt.balance, debt.minimumPayment]) {
      if (amount.currency.code !== code)
        throw new CurrencyMismatchError(code, amount.currency.code);
    }
    if (ids.has(debt.id)) throw invalidDebt(`Debt id '${debt.id}' is repeated.`);
    ids.add(debt.id);
    if (debt.balance.minorUnits <= 0n) throw invalidDebt(`Debt '${debt.id}' has no balance.`);
    if (debt.minimumPayment.minorUnits < 0n) {
      throw invalidDebt(`Debt '${debt.id}' has a negative minimum payment.`);
    }
    if (debt.monthlyRate.isNegative() && !debt.monthlyRate.isZero()) {
      throw new FinancialInputError('RATE_OUT_OF_DOMAIN', `Debt '${debt.id}' has a negative rate.`);
    }
  }
  if (input.extra.currency.code !== code) {
    throw new CurrencyMismatchError(code, input.extra.currency.code);
  }
  if (input.extra.minorUnits < 0n) throw invalidDebt('The monthly extra must be non-negative.');
  return code;
}

function neverAmortizes(detail: string): FinancialInputError {
  return new FinancialInputError(
    'DEBT_NEVER_AMORTIZES',
    `${detail} Raise the monthly payment or renegotiate the rate; FINCH will not show a ` +
      'payoff date that cannot happen.',
  );
}

function simulate(
  input: PayoffPlanInput,
  strategy: PayoffStrategy,
  code: string,
): PayoffStrategyResult {
  const { debts } = input;
  const balances = debts.map((d) => d.balance.minorUnits);
  const budget =
    debts.reduce((sum, d) => sum + d.minimumPayment.minorUnits, 0n) + input.extra.minorUnits;

  const firstInterest = debts.reduce(
    (sum, d, j) => sum + interestOn(balances[j] ?? 0n, d.monthlyRate),
    0n,
  );
  if (budget <= firstInterest) {
    throw neverAmortizes(
      'The monthly budget does not cover the interest, so the debt never shrinks.',
    );
  }

  let totalInterest = 0n;
  let totalPaid = 0n;
  const order: { id: string; month: number }[] = [];
  const cleared = new Set<number>();
  let month = 0;

  while (balances.some((b) => b > 0n)) {
    month += 1;
    if (month > MAX_PAYOFF_MONTHS) {
      throw neverAmortizes(`The debt is not cleared within ${MAX_PAYOFF_MONTHS} months.`);
    }
    debts.forEach((debt, j) => {
      const balance = balances[j] ?? 0n;
      if (balance > 0n) {
        const interest = interestOn(balance, debt.monthlyRate);
        balances[j] = balance + interest;
        totalInterest += interest;
      }
    });

    let remaining = budget;
    debts.forEach((debt, j) => {
      const balance = balances[j] ?? 0n;
      if (balance > 0n) {
        const pay =
          debt.minimumPayment.minorUnits < balance ? debt.minimumPayment.minorUnits : balance;
        balances[j] = balance - pay;
        remaining -= pay;
      }
    });

    const open = debts.map((_, j) => j).filter((j) => (balances[j] ?? 0n) > 0n);
    open.sort((a, b) => {
      if (strategy === 'AVALANCHE') {
        const byRate = (debts[b]?.monthlyRate ?? decimal('0')).comparedTo(
          debts[a]?.monthlyRate ?? decimal('0'),
        );
        return byRate !== 0 ? byRate : a - b;
      }
      const ba = balances[a] ?? 0n;
      const bb = balances[b] ?? 0n;
      return ba < bb ? -1 : ba > bb ? 1 : a - b;
    });
    for (const j of open) {
      if (remaining <= 0n) break;
      const balance = balances[j] ?? 0n;
      const pay = remaining < balance ? remaining : balance;
      balances[j] = balance - pay;
      remaining -= pay;
    }
    totalPaid += budget - remaining;

    debts.forEach((debt, j) => {
      if (balances[j] === 0n && !cleared.has(j)) {
        cleared.add(j);
        order.push({ id: debt.id, month });
      }
    });
  }

  return {
    monthsToDebtFree: month,
    totalInterest: Money.fromMinorUnits(totalInterest, code),
    totalPaid: Money.fromMinorUnits(totalPaid, code),
    payoffOrder: order,
  };
}

export function payoffPlan(input: PayoffPlanInput): PayoffPlanResult {
  const code = validate(input);
  return {
    formula: { formulaId: 'debt.payoff_plan', version: 1 },
    AVALANCHE: simulate(input, 'AVALANCHE', code),
    SNOWBALL: simulate(input, 'SNOWBALL', code),
  };
}
