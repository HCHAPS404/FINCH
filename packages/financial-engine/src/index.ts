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
export {
  DECIMAL_PRECISION,
  decimal,
  roundDecimal,
  moneyToDecimal,
  decimalToMoney,
} from './decimal.js';
export type { Decimal } from './decimal.js';
export { FinancialInputError, FINANCIAL_INPUT_ERROR_CODES } from './errors.js';
export type { FinancialInputErrorCode } from './errors.js';

// Credit engine (S1-01). Importing './credit/formulas.js' registers its formulas.
import './credit/formulas.js';
export { convertRate, parseQuote, QUOTES, SUPPORTED_PERIODS } from './credit/rate.js';
export type { RateQuote, QuoteName, PeriodsPerYear, ConvertRateOptions } from './credit/rate.js';
export { frenchAmortization, MAX_PERIODS } from './credit/french.js';
export type {
  FrenchAmortizationInput,
  FrenchAmortizationResult,
  FrenchScheduleRow,
} from './credit/french.js';
export {
  totalCost,
  solveMonthlyIrr,
  IRR_TOLERANCE,
  IRR_MAX_ITERATIONS,
} from './credit/total-cost.js';
export type { TotalCostInput, TotalCostResult, InsuranceSpec } from './credit/total-cost.js';
export { usuryCheck } from './credit/usury.js';
export type { UsuryCheckInput, UsuryCheckResult } from './credit/usury.js';
export { compareRefinance } from './credit/refinance.js';
export type {
  CompareRefinanceInput,
  CompareRefinanceResult,
  RefinanceSide,
} from './credit/refinance.js';
export { payoffPlan, PAYOFF_STRATEGIES, MAX_PAYOFF_MONTHS } from './credit/payoff.js';
export type {
  PayoffDebt,
  PayoffPlanInput,
  PayoffPlanResult,
  PayoffStrategy,
  PayoffStrategyResult,
} from './credit/payoff.js';

// Cash-flow formulas (S1-01). Importing './cashflow/formulas.js' registers them.
import './cashflow/formulas.js';
export { forecast30d, conservativeIncome, FORECAST_HORIZON_DAYS } from './cashflow/forecast.js';
export type {
  BusinessCalendar,
  CashflowEvent,
  DateShift,
  ForecastInput,
  ForecastPoint,
  ForecastResult,
} from './cashflow/forecast.js';
export { safeToSpend } from './cashflow/safe-to-spend.js';
export type { SafeToSpendResult } from './cashflow/safe-to-spend.js';
export { toDayNumber, toIsoDate, isoWeekday } from './cashflow/civil-date.js';
