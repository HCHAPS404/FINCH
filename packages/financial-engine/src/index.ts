/**
 * @finch/financial-engine — deterministic financial mathematics.
 *
 * PURITY CONTRACT (README §14, enforced by .dependency-cruiser.cjs):
 *   no NestJS · no React · no AWS SDK · no Drizzle · no LLM SDKs · no I/O · no ambient time
 *
 * Everything here must be computable with nothing but its inputs. That is what makes
 * a historical decision reproducible years later (Constitution §4.5) and what lets the
 * correctness harness assert real invariants instead of mocking the world.
 */
export { Money, divideRounded, sumMoney, CurrencyMismatchError, ROUNDING_MODES } from './money.js';
export type { RoundingMode } from './money.js';
export { COP, USD, EUR, CURRENCIES, getCurrency } from './currency.js';
export type { Currency } from './currency.js';
export { registerFormula, getFormula, listFormulas } from './formula-registry.js';
export type { FormulaDefinition, FormulaTestVector } from './formula-registry.js';
export { allocateBudget, ALLOCATION_LAYERS } from './budget-allocate.js';
export type {
  AllocationLayer,
  AllocationLineItem,
  Obligation,
  DebtMinimum,
  Goal,
  IncomeRule,
  SurplusStrategy,
  BudgetAllocateInput,
  BudgetAllocateResult,
} from './budget-allocate.js';
