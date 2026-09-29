/**
 * credit.total_cost@1 — total cost of a fixed-instalment credit and its real effective rate.
 * Spec: docs/financial-formulas/colombia-credit.md §3.
 *
 * Monthly cash flows from the borrower's side:
 *
 *   t = 0 : + (P − upfront_costs)
 *   t = k : − (C_k + insurance_k + handling_fee + other_charges + gmf_k)     k = 1..n
 *
 * `C_k` comes from amortization.french@1. Insurance and GMF are rounded HALF_EVEN to the
 * minor unit per period. The monthly IRR `r` (NPV = 0) is solved by bisection in decimal
 * (width tolerance 1e−12, at most 200 iterations) and annualized as (1 + r)^12 − 1.
 *
 * GMF defaults to 0: whether a debit is taxed is a jurisdiction question the caller
 * answers explicitly (spec §3, VERIFY exemptions case by case).
 */
import { decimal, roundDecimal, type Decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { CurrencyMismatchError, Money } from '../money.js';
import { frenchAmortization } from './french.js';

export type InsuranceSpec =
  | { readonly basis: 'NONE' }
  /** Rate per period applied to the balance outstanding before that period's payment. */
  | { readonly basis: 'OUTSTANDING'; readonly rate: Decimal }
  /** Rate per period applied to the original principal. */
  | { readonly basis: 'ORIGINAL'; readonly rate: Decimal }
  /** A fixed amount per period. */
  | { readonly basis: 'FIXED'; readonly amount: Money };

export interface TotalCostInput {
  readonly principal: Money;
  /** Effective monthly rate of the credit, as a fraction. */
  readonly monthlyRate: Decimal;
  /** Number of monthly instalments. */
  readonly periods: number;
  readonly upfrontCosts?: Money;
  readonly insurance?: InsuranceSpec;
  /** Charged every period (cuota de manejo). */
  readonly handlingFee?: Money;
  /** Any other charge billed every period. */
  readonly otherCharges?: Money;
  /** Tax on financial transactions applied to each debit (0.004 = 4 × 1,000). */
  readonly gmfRate?: Decimal;
}

export interface TotalCostResult {
  readonly formula: { readonly formulaId: 'credit.total_cost'; readonly version: 1 };
  readonly instalment: Money;
  readonly netDisbursement: Money;
  /** Outflows per period, k = 1..n, including insurance, fees and GMF. */
  readonly outflows: readonly Money[];
  readonly totalPaid: Money;
  readonly totalInterest: Money;
  readonly totalInsurance: Money;
  readonly totalFees: Money;
  readonly totalGmf: Money;
  readonly upfrontCosts: Money;
  /** Everything paid beyond what was actually received: totalPaid − netDisbursement. */
  readonly totalCost: Money;
  /** Monthly internal rate of return of the borrower's cash flows (±5e−13). */
  readonly monthlyIrr: Decimal;
  /** (1 + monthlyIrr)^12 − 1. */
  readonly effectiveAnnualRate: Decimal;
}

/** Bisection stops when the bracket is narrower than this (1e−12). */
export const IRR_TOLERANCE = '0.000000000001';
export const IRR_MAX_ITERATIONS = 200;

const ONE = decimal('1');
const ZERO = decimal('0');

function roundToMinor(value: Decimal): bigint {
  return BigInt(roundDecimal(value, 0, 'HALF_EVEN').toFixed(0));
}

function invalidCharges(message: string): FinancialInputError {
  return new FinancialInputError('INVALID_CHARGES', message);
}

/** NPV of the borrower's flows at monthly rate r: inflow at t=0, outflows at t=1..n. */
function npv(net: Decimal, outflows: readonly Decimal[], r: Decimal): Decimal {
  const discount = ONE.dividedBy(ONE.plus(r));
  let factor = ONE;
  let present = ZERO;
  for (const outflow of outflows) {
    factor = factor.times(discount);
    present = present.plus(outflow.times(factor));
  }
  return net.minus(present);
}

/**
 * Bisection on NPV(r), which is strictly increasing in r for positive outflows.
 * Exported for tests of the solver itself; the formula entry point is `totalCost`.
 */
export function solveMonthlyIrr(net: Decimal, outflows: readonly Decimal[]): Decimal {
  const atZero = npv(net, outflows, ZERO);
  if (atZero.isZero()) return ZERO;
  if (atZero.greaterThan(ZERO)) {
    // Outflows below the amount received: a negative cost this formula does not model.
    throw new FinancialInputError(
      'IRR_NOT_FOUND',
      'The payments are smaller than the amount received; there is no non-negative rate.',
    );
  }
  let lo = ZERO;
  let hi = ONE;
  let doublings = 0;
  while (npv(net, outflows, hi).lessThanOrEqualTo(ZERO)) {
    lo = hi;
    hi = hi.times(2);
    doublings += 1;
    if (doublings > 60) {
      throw new FinancialInputError('IRR_NOT_FOUND', 'The monthly IRR exceeds any plausible rate.');
    }
  }
  const tolerance = decimal(IRR_TOLERANCE);
  for (let i = 0; i < IRR_MAX_ITERATIONS && hi.minus(lo).greaterThan(tolerance); i += 1) {
    const mid = lo.plus(hi).dividedBy(2);
    if (npv(net, outflows, mid).lessThan(ZERO)) lo = mid;
    else hi = mid;
  }
  return lo.plus(hi).dividedBy(2);
}

export function totalCost(input: TotalCostInput): TotalCostResult {
  const { principal } = input;
  const code = principal.currency.code;
  const zero = Money.zero(code);
  const upfront = input.upfrontCosts ?? zero;
  const handling = input.handlingFee ?? zero;
  const other = input.otherCharges ?? zero;
  const insurance: InsuranceSpec = input.insurance ?? { basis: 'NONE' };
  const gmfRate = input.gmfRate ?? ZERO;

  const fixedPremium = insurance.basis === 'FIXED' ? [insurance.amount] : [];
  for (const charge of [upfront, handling, other, ...fixedPremium]) {
    if (charge.currency.code !== code) throw new CurrencyMismatchError(code, charge.currency.code);
    if (charge.minorUnits < 0n) throw invalidCharges('Charges must be non-negative.');
  }
  if (principal.minorUnits > 0n && upfront.minorUnits >= principal.minorUnits) {
    throw invalidCharges('Upfront costs must be smaller than the principal.');
  }
  if (gmfRate.isNegative() || gmfRate.greaterThanOrEqualTo(ONE)) {
    throw new FinancialInputError('RATE_OUT_OF_DOMAIN', 'The GMF rate must be in [0, 1).');
  }
  switch (insurance.basis) {
    case 'NONE':
      break;
    case 'OUTSTANDING':
    case 'ORIGINAL':
      if (insurance.rate.isNegative() && !insurance.rate.isZero()) {
        throw invalidCharges('The insurance rate must be non-negative.');
      }
      break;
    case 'FIXED':
      break; // validated with the other charges above
  }

  const schedule = frenchAmortization({
    principal,
    periodicRate: input.monthlyRate,
    periods: input.periods,
  });

  const outflows: bigint[] = [];
  let totalInsurance = 0n;
  let totalFees = 0n;
  let totalGmf = 0n;
  let balanceBefore = principal.minorUnits;
  const perPeriodFees = handling.minorUnits + other.minorUnits;
  for (const row of schedule.schedule) {
    let premium: bigint;
    switch (insurance.basis) {
      case 'NONE':
        premium = 0n;
        break;
      case 'OUTSTANDING':
        premium = roundToMinor(insurance.rate.times(decimal(balanceBefore)));
        break;
      case 'ORIGINAL':
        premium = roundToMinor(insurance.rate.times(decimal(principal.minorUnits)));
        break;
      case 'FIXED':
        premium = insurance.amount.minorUnits;
        break;
    }
    const debit = row.payment.minorUnits + premium + perPeriodFees;
    const gmf = roundToMinor(gmfRate.times(decimal(debit)));
    outflows.push(debit + gmf);
    totalInsurance += premium;
    totalFees += perPeriodFees;
    totalGmf += gmf;
    balanceBefore = row.balance.minorUnits;
  }

  const net = principal.minorUnits - upfront.minorUnits;
  const totalPaid = outflows.reduce((sum, value) => sum + value, 0n);
  const monthlyIrr = solveMonthlyIrr(
    decimal(net),
    outflows.map((value) => decimal(value)),
  );
  const money = (value: bigint): Money => Money.fromMinorUnits(value, code);

  return {
    formula: { formulaId: 'credit.total_cost', version: 1 },
    instalment: schedule.instalment,
    netDisbursement: money(net),
    outflows: outflows.map(money),
    totalPaid: money(totalPaid),
    totalInterest: schedule.totalInterest,
    totalInsurance: money(totalInsurance),
    totalFees: money(totalFees),
    totalGmf: money(totalGmf),
    upfrontCosts: upfront,
    totalCost: money(totalPaid - net),
    monthlyIrr,
    effectiveAnnualRate: ONE.plus(monthlyIrr).pow(12).minus(ONE),
  };
}
