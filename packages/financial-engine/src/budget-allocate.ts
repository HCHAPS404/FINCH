/**
 * `budget.allocate@1` — docs/financial-formulas/personal-finance.md §1 (Payday
 * Autopilot, catalog B1). The layered, deterministic split of one paycheck across
 * obligations, debt minimums, savings and goals that the rest of Payday Autopilot is
 * built on (README §14.2, §15: a formula must exist, versioned and tested, before it
 * informs a recommendation).
 *
 * Dates are compared as ISO-8601 strings (`YYYY-MM-DD`) lexicographically rather than
 * via `Date` — this package may not read ambient time (README §14's purity contract),
 * and string comparison is exact where `Date` parsing would invite timezone drift for
 * no benefit here.
 */
import { Money, type RoundingMode } from './money.js';
import { registerFormula } from './formula-registry.js';

export const ALLOCATION_LAYERS = [
  'OBLIGATION',
  'DEBT_MINIMUM',
  'PAY_YOURSELF_FIRST',
  'EMERGENCY_FUND',
  'GOAL',
  'SURPLUS',
] as const;

export type AllocationLayer = (typeof ALLOCATION_LAYERS)[number];

export interface AllocationLineItem {
  readonly destination: string;
  readonly amount: Money;
  readonly targetDate: string | undefined;
  readonly reason: string;
  readonly layer: AllocationLayer;
}

export interface Obligation {
  readonly name: string;
  readonly amount: Money;
  readonly dueDate: string;
}

export interface DebtMinimum {
  readonly name: string;
  readonly minimumPayment: Money;
  readonly dueDate: string;
  /** Required only to pick a target under `DEBT_AVALANCHE` (highest rate first). */
  readonly interestRateBps?: number;
}

export interface Goal {
  readonly name: string;
  /** Lower is higher priority. Ties break by `targetDate`, ascending. */
  readonly priority: number;
  readonly targetDate: string;
  readonly suggestedContribution: Money;
}

/**
 * `RULE_50_30_20` is applied at this formula's "pay yourself first" layer as a fixed
 * 20 % of income to savings — the 50 %/30 % needs/wants split has no separate
 * destination in this layered model (needs already flow through obligations and debt
 * minimums in layers 1–2; this formula does not categorize discretionary spending).
 * Documented here rather than silently assumed, per README §14.2 — a different
 * interpretation is a new formula version, not a silent change to this one.
 */
export type IncomeRule =
  | {
      readonly type: 'PAY_YOURSELF_FIRST';
      readonly numerator: bigint;
      readonly denominator: bigint;
    }
  | { readonly type: 'RULE_50_30_20' }
  | { readonly type: 'CUSTOM' };

export type SurplusStrategy = 'DEBT_AVALANCHE' | 'SAVE';

export interface BudgetAllocateInput {
  readonly income: Money;
  readonly nextIncomeDate: string;
  readonly obligations: readonly Obligation[];
  readonly debts: readonly DebtMinimum[];
  readonly emergencyFundTarget: Money;
  readonly emergencyFundCurrent: Money;
  readonly emergencyFundCapPerCycle: Money;
  readonly goals: readonly Goal[];
  readonly rule: IncomeRule;
  readonly surplusStrategy: SurplusStrategy;
  readonly roundingMode: RoundingMode;
}

export interface BudgetAllocateResult {
  readonly allocations: readonly AllocationLineItem[];
  /**
   * What's left after every layer. Conserves exactly: `sum(allocations) + free ===
   * income` always holds, including in a deficit — `free` goes negative rather than
   * breaking the invariant, and `deficit` is the same shortfall as a non-negative
   * magnitude for callers that don't want to interpret a negative "free" amount.
   */
  readonly free: Money;
  readonly deficit: Money | undefined;
}

function takeUpTo(remaining: Money, desired: Money): Money {
  if (!desired.isPositive()) return Money.zero(desired.currency.code);
  return desired.compare(remaining) > 0 ? remaining : desired;
}

export function allocateBudget(input: BudgetAllocateInput): BudgetAllocateResult {
  if (!input.income.isPositive()) {
    throw new RangeError(
      `budget.allocate@1 requires a positive income, received ${input.income.toString()}.`,
    );
  }
  const currency = input.income.currency.code;
  const allocations: AllocationLineItem[] = [];
  let remaining = input.income;

  // Layers 1–2: obligations and debt minimums due before the next paycheck commit
  // unconditionally — they are due regardless of whether the cycle can absorb them.
  const dueObligations = [...input.obligations]
    .filter((o) => o.dueDate <= input.nextIncomeDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  for (const obligation of dueObligations) {
    allocations.push({
      destination: obligation.name,
      amount: obligation.amount,
      targetDate: obligation.dueDate,
      reason: 'Obligación con vencimiento antes del próximo ingreso',
      layer: 'OBLIGATION',
    });
    remaining = remaining.subtract(obligation.amount);
  }

  const dueDebts = [...input.debts]
    .filter((d) => d.dueDate <= input.nextIncomeDate)
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));
  for (const debt of dueDebts) {
    allocations.push({
      destination: debt.name,
      amount: debt.minimumPayment,
      targetDate: debt.dueDate,
      reason: 'Mínimo de deuda con vencimiento antes del próximo ingreso',
      layer: 'DEBT_MINIMUM',
    });
    remaining = remaining.subtract(debt.minimumPayment);
  }

  if (remaining.isNegative()) {
    // Deficit: layers 3+ are skipped entirely (personal-finance.md §1). `free` carries
    // the shortfall as a negative amount so the conservation invariant still holds.
    return { allocations, free: remaining, deficit: remaining.negate() };
  }

  // Layer 3: pay yourself first, if the rule asks for it.
  if (input.rule.type === 'PAY_YOURSELF_FIRST') {
    const desired = input.income.multiplyByRatio(
      input.rule.numerator,
      input.rule.denominator,
      input.roundingMode,
    );
    const amount = takeUpTo(remaining, desired);
    if (amount.isPositive()) {
      allocations.push({
        destination: 'Ahorro (págate primero)',
        amount,
        targetDate: undefined,
        reason: 'Regla PAY_YOURSELF_FIRST aplicada sobre el ingreso',
        layer: 'PAY_YOURSELF_FIRST',
      });
      remaining = remaining.subtract(amount);
    }
  } else if (input.rule.type === 'RULE_50_30_20') {
    const desired = input.income.multiplyByRatio(20n, 100n, input.roundingMode);
    const amount = takeUpTo(remaining, desired);
    if (amount.isPositive()) {
      allocations.push({
        destination: 'Ahorro (regla 50/30/20)',
        amount,
        targetDate: undefined,
        reason: '20 % del ingreso a ahorro bajo la regla 50/30/20',
        layer: 'PAY_YOURSELF_FIRST',
      });
      remaining = remaining.subtract(amount);
    }
  }

  // Layer 4: top up the emergency fund toward its target, capped per cycle.
  const emergencyGap = input.emergencyFundTarget.subtract(input.emergencyFundCurrent);
  const cappedGap = emergencyGap.isPositive()
    ? emergencyGap.compare(input.emergencyFundCapPerCycle) > 0
      ? input.emergencyFundCapPerCycle
      : emergencyGap
    : Money.zero(currency);
  const emergencyContribution = takeUpTo(remaining, cappedGap);
  if (emergencyContribution.isPositive()) {
    allocations.push({
      destination: 'Colchón de emergencia',
      amount: emergencyContribution,
      targetDate: undefined,
      reason: 'Aporte al colchón hasta el tope por ciclo',
      layer: 'EMERGENCY_FUND',
    });
    remaining = remaining.subtract(emergencyContribution);
  }

  // Layer 5: goals, by priority then target date.
  const orderedGoals = [...input.goals].sort((a, b) =>
    a.priority !== b.priority ? a.priority - b.priority : a.targetDate.localeCompare(b.targetDate),
  );
  for (const goal of orderedGoals) {
    const amount = takeUpTo(remaining, goal.suggestedContribution);
    if (amount.isPositive()) {
      allocations.push({
        destination: goal.name,
        amount,
        targetDate: goal.targetDate,
        reason: 'Aporte sugerido a la meta, por prioridad',
        layer: 'GOAL',
      });
      remaining = remaining.subtract(amount);
    }
  }

  // Layer 6: surplus strategy. SAVE is a no-op — whatever is left simply becomes
  // `free`; there is no separate general-savings destination in this formula.
  if (input.surplusStrategy === 'DEBT_AVALANCHE' && remaining.isPositive()) {
    const target = [...input.debts]
      .filter((d) => d.interestRateBps !== undefined)
      .sort((a, b) => (b.interestRateBps ?? 0) - (a.interestRateBps ?? 0))[0];
    if (target !== undefined) {
      allocations.push({
        destination: target.name,
        amount: remaining,
        targetDate: undefined,
        reason: 'Abono extra al excedente — avalancha (mayor tasa primero)',
        layer: 'SURPLUS',
      });
      remaining = Money.zero(currency);
    }
  }

  return { allocations, free: remaining, deficit: undefined };
}

registerFormula({
  formulaId: 'budget.allocate',
  version: 1,
  purpose:
    'Split one paycheck across due obligations, debt minimums, savings and goals in a ' +
    'fixed, deterministic layer order, conserving the total exactly.',
  inputs: [
    { name: 'income', unit: 'Money', description: 'The paycheck being allocated.' },
    {
      name: 'nextIncomeDate',
      unit: 'ISO date',
      description: 'Obligations/debts due on or before this date are committed this cycle.',
    },
    { name: 'obligations', unit: 'list', description: 'Fixed bills with a due date.' },
    { name: 'debts', unit: 'list', description: 'Debt minimum payments with a due date.' },
    { name: 'emergencyFundTarget/Current/CapPerCycle', unit: 'Money', description: 'Buffer goal.' },
    { name: 'goals', unit: 'list', description: 'Savings goals with priority and target date.' },
    { name: 'rule', unit: 'enum', description: 'PAY_YOURSELF_FIRST(p) | RULE_50_30_20 | CUSTOM.' },
    { name: 'surplusStrategy', unit: 'enum', description: 'DEBT_AVALANCHE | SAVE.' },
  ],
  outputUnit: 'list of (destination, Money, layer) + free + deficit',
  rounding: 'Caller-specified RoundingMode, applied only to the pay-yourself-first ratio.',
  assumptions: [
    'Obligations and debt minimums due before the next paycheck are committed unconditionally, ' +
      'even into a deficit — they are due regardless of what the cycle can absorb.',
    'RULE_50_30_20 is interpreted as a fixed 20% of income to savings at the pay-yourself-first ' +
      'layer; this formula does not categorize spending into needs/wants.',
    'DEBT_AVALANCHE sends the entire surplus to the single highest-interestRateBps debt; debts ' +
      'without a rate are not eligible targets.',
  ],
  reference: 'docs/financial-formulas/personal-finance.md §1.',
  edgeCases: [
    'Deficit (layers 1–2 alone exceed income): layers 3+ are skipped, free goes negative by ' +
      'exactly the shortfall, and deficit reports that shortfall as a positive amount.',
    'No obligations, debts or goals, CUSTOM rule: the entire income becomes free.',
    'A goal or the emergency fund can receive a partial contribution when remaining runs out ' +
      'mid-layer — never more than what remains.',
  ],
  implementationPath: 'packages/financial-engine/src/budget-allocate.ts#allocateBudget',
  testVectors: [
    {
      description: 'Nominal cycle: obligation, debt minimum, pay-yourself-first, goal, surplus',
      inputs: { income: '3000000', currency: 'COP' },
      expected: 'sum(allocations) + free === income',
    },
    {
      description: 'Deficit: obligations and debt minimums alone exceed income',
      inputs: { income: '100000', currency: 'COP' },
      expected: 'free is negative; deficit = -free; sum(allocations) + free === income',
    },
  ],
});
