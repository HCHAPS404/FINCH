/**
 * budget.allocate@1 — split an income across the month (Payday Autopilot, B1).
 * Spec: docs/financial-formulas/personal-finance.md §1 (resolved version-1 definitions there).
 *
 * Layers consume `remaining` in order:
 *   1 OBLIGATION          due ≤ next income, by due date then input order (full amount)
 *   2 DEBT_MINIMUM        due ≤ next income, by due date then input order (full amount)
 *     → if remaining < 0: deficit; the shortfall is reported and layers 3+ get nothing
 *   3 PAY_YOURSELF_FIRST  min(remaining, round(p · income)); RULE_50_30_20 means p = 0.20
 *   4 BUFFER              min(remaining, max(0, target − current), cap per cycle)
 *   5 GOAL                by priority (1 first), target date, input order: min(remaining, suggested)
 *   6 SURPLUS             round(surplusShare · remaining) → the highest-rate debt, capped at its
 *                         balance (DEBT_AVALANCHE), or savings (SAVINGS)
 *   7 FREE                what is left
 *
 * Rounding: HALF_EVEN to the minor unit, only in layers 3 and 6.
 * Invariant: Σ allocations + free = income + shortfall, exactly.
 */
import { decimal, roundDecimal, type Decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { CurrencyMismatchError, Money } from '../money.js';
import { toDayNumber } from '../cashflow/civil-date.js';

export type AllocationLayer =
  'OBLIGATION' | 'DEBT_MINIMUM' | 'PAY_YOURSELF_FIRST' | 'BUFFER' | 'GOAL' | 'SURPLUS';

export type SavingsRule =
  | { readonly kind: 'NONE' }
  | { readonly kind: 'RULE_50_30_20' }
  | { readonly kind: 'PAY_YOURSELF_FIRST'; readonly rate: Decimal };

export interface AllocateInput {
  readonly income: Money;
  /** `YYYY-MM-DD` of the next expected income; items due after it wait for that income. */
  readonly nextIncome: string;
  readonly obligations: readonly { id: string; amount: Money; dueDate: string }[];
  readonly debts: readonly {
    id: string;
    minimum: Money;
    dueDate: string;
    monthlyRate: Decimal;
    balance: Money;
  }[];
  readonly rule: SavingsRule;
  readonly buffer: { readonly target: Money; readonly current: Money; readonly capPerCycle: Money };
  readonly goals: readonly {
    id: string;
    /** 1 is the most important. */
    priority: number;
    targetDate: string;
    suggested: Money;
  }[];
  readonly strategy: 'DEBT_AVALANCHE' | 'SAVINGS';
  /** Share of what remains after goals that goes to the strategy, in [0, 1]. */
  readonly surplusShare: Decimal;
}

export interface AllocationLine {
  readonly layer: AllocationLayer;
  /** An obligation, debt or goal id, or `savings` / `buffer`. */
  readonly destination: string;
  readonly amount: Money;
}

export interface AllocateResult {
  readonly formula: { readonly formulaId: 'budget.allocate'; readonly version: 1 };
  readonly lines: readonly AllocationLine[];
  readonly free: Money;
  /** How much layers 1–2 exceed the income; 0 when there is no deficit. */
  readonly shortfall: Money;
}

const PAY_YOURSELF_FIRST_50_30_20 = '0.20';

function round(value: Decimal): bigint {
  return BigInt(roundDecimal(value, 0, 'HALF_EVEN').toFixed(0));
}

function isShare(value: Decimal): boolean {
  return !value.isNegative() && value.lessThanOrEqualTo(1);
}

function min(...values: bigint[]): bigint {
  return values.reduce((a, b) => (b < a ? b : a));
}

export function budgetAllocate(input: AllocateInput): AllocateResult {
  const code = input.income.currency.code;
  const amounts: Money[] = [
    input.income,
    input.buffer.target,
    input.buffer.current,
    input.buffer.capPerCycle,
    ...input.obligations.map((o) => o.amount),
    ...input.debts.flatMap((d) => [d.minimum, d.balance]),
    ...input.goals.map((g) => g.suggested),
  ];
  for (const amount of amounts) {
    if (amount.currency.code !== code) throw new CurrencyMismatchError(code, amount.currency.code);
    if (amount.minorUnits < 0n) {
      throw new FinancialInputError('INVALID_CHARGES', 'Amounts must be non-negative.');
    }
  }
  const rate =
    input.rule.kind === 'PAY_YOURSELF_FIRST'
      ? input.rule.rate
      : decimal(input.rule.kind === 'RULE_50_30_20' ? PAY_YOURSELF_FIRST_50_30_20 : '0');
  if (!isShare(rate) || !isShare(input.surplusShare)) {
    throw new FinancialInputError('RATE_OUT_OF_DOMAIN', 'Shares must be between 0 and 1.');
  }
  const next = toDayNumber(input.nextIncome);

  let remaining = input.income.minorUnits;
  const lines: AllocationLine[] = [];
  const add = (layer: AllocationLayer, destination: string, amount: bigint): void => {
    if (amount > 0n) {
      lines.push({ layer, destination, amount: Money.fromMinorUnits(amount, code) });
      remaining -= amount;
    }
  };
  const byDueDate = <T extends { dueDate: string }>(items: readonly T[]): T[] =>
    items
      .map((item, index) => ({ item, index, day: toDayNumber(item.dueDate) }))
      .filter((x) => x.day <= next)
      .sort((a, b) => a.day - b.day || a.index - b.index)
      .map((x) => x.item);

  for (const o of byDueDate(input.obligations)) add('OBLIGATION', o.id, o.amount.minorUnits);
  for (const d of byDueDate(input.debts)) add('DEBT_MINIMUM', d.id, d.minimum.minorUnits);
  if (remaining < 0n) {
    return {
      formula: { formulaId: 'budget.allocate', version: 1 },
      lines,
      free: Money.zero(code),
      shortfall: Money.fromMinorUnits(-remaining, code),
    };
  }

  add(
    'PAY_YOURSELF_FIRST',
    'savings',
    min(remaining, round(rate.times(decimal(input.income.minorUnits)))),
  );

  const { target, current, capPerCycle } = input.buffer;
  const gap = target.minorUnits - current.minorUnits;
  add('BUFFER', 'buffer', min(remaining, gap > 0n ? gap : 0n, capPerCycle.minorUnits));

  const goals = input.goals
    .map((goal, index) => ({ goal, index, day: toDayNumber(goal.targetDate) }))
    .sort((a, b) => a.goal.priority - b.goal.priority || a.day - b.day || a.index - b.index);
  for (const { goal } of goals) add('GOAL', goal.id, min(remaining, goal.suggested.minorUnits));

  const share = round(input.surplusShare.times(decimal(remaining)));
  const target0 = [...input.debts]
    .map((debt, index) => ({ debt, index }))
    .sort((a, b) => b.debt.monthlyRate.comparedTo(a.debt.monthlyRate) || a.index - b.index)[0];
  if (input.strategy === 'DEBT_AVALANCHE' && target0 !== undefined) {
    add('SURPLUS', target0.debt.id, min(share, target0.debt.balance.minorUnits));
  } else {
    add('SURPLUS', 'savings', share);
  }

  return {
    formula: { formulaId: 'budget.allocate', version: 1 },
    lines,
    free: Money.fromMinorUnits(remaining, code),
    shortfall: Money.zero(code),
  };
}
