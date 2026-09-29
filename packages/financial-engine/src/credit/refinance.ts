/**
 * credit.compare_refinance@1 — keep the current debt or move it to an offer.
 * Spec: docs/financial-formulas/colombia-credit.md §5.
 *
 * The current debt keeps its French schedule on the remaining balance; the offer
 * refinances that same balance. A fixed monthly charge (insurance, handling fee) is added
 * to every instalment of each side. Switching costs are paid out of pocket at t = 0.
 *
 * Nominal figures are exact sums of minor units. The present value of the savings is
 * discounted at the user's monthly opportunity rate and rounded HALF_EVEN to the minor
 * unit once, at the end. Truth propagates conservatively: any ESTIMATED input makes the
 * whole result ESTIMATED.
 */
import type { TruthClass } from '@finch/contracts';

import { decimal, roundDecimal, type Decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { CurrencyMismatchError, Money } from '../money.js';
import { frenchAmortization } from './french.js';

export interface RefinanceSide {
  /** Effective monthly rate. */
  readonly monthlyRate: Decimal;
  /** Remaining (current) or offered number of monthly instalments. */
  readonly periods: number;
  /** Fixed charge added to every instalment (insurance, handling fee). */
  readonly monthlyCharges?: Money;
}

export interface CompareRefinanceInput {
  /** Outstanding balance of the current debt; the amount the offer would refinance. */
  readonly balance: Money;
  readonly current: RefinanceSide;
  readonly offer: RefinanceSide;
  /** Paid out of pocket at t = 0 (study, appraisal, prepayment penalty). */
  readonly switchingCosts?: Money;
  /** Monthly rate at which the user's money could otherwise grow. */
  readonly opportunityRate: Decimal;
  /** Truth class of every input that fed this comparison. */
  readonly inputTruth: readonly TruthClass[];
}

export interface CompareRefinanceResult {
  readonly formula: { readonly formulaId: 'credit.compare_refinance'; readonly version: 1 };
  /** First-month outflow of each side, charges included. */
  readonly currentInstalment: Money;
  readonly offerInstalment: Money;
  /** offerInstalment − currentInstalment. Negative means the offer lowers the instalment. */
  readonly instalmentDelta: Money;
  readonly totalCurrent: Money;
  /** Offer outflows plus switching costs. */
  readonly totalOffer: Money;
  /** totalCurrent − totalOffer. Negative means the offer costs more. */
  readonly nominalSavings: Money;
  readonly pvSavings: Money;
  /** First month whose cumulative savings cover the switching costs; null if never. */
  readonly breakEvenMonth: number | null;
  /** The instalment drops but the total paid rises: a longer term, not a cheaper credit. */
  readonly longerTermAlert: boolean;
  readonly truthClass: 'DERIVED_DETERMINISTIC' | 'ESTIMATED';
}

const ONE = decimal('1');

function sideFlows(balance: Money, side: RefinanceSide): bigint[] {
  const charges = side.monthlyCharges ?? Money.zero(balance.currency.code);
  if (charges.currency.code !== balance.currency.code) {
    throw new CurrencyMismatchError(balance.currency.code, charges.currency.code);
  }
  if (charges.minorUnits < 0n) {
    throw new FinancialInputError('INVALID_CHARGES', 'Monthly charges must be non-negative.');
  }
  const { schedule } = frenchAmortization({
    principal: balance,
    periodicRate: side.monthlyRate,
    periods: side.periods,
  });
  return schedule.map((row) => row.payment.minorUnits + charges.minorUnits);
}

function presentValue(values: readonly bigint[], rate: Decimal): Decimal {
  const discount = ONE.dividedBy(ONE.plus(rate));
  let factor = ONE;
  let total = decimal('0');
  for (const value of values) {
    factor = factor.times(discount);
    total = total.plus(decimal(value).times(factor));
  }
  return total;
}

export function compareRefinance(input: CompareRefinanceInput): CompareRefinanceResult {
  const code = input.balance.currency.code;
  const switching = input.switchingCosts ?? Money.zero(code);
  if (switching.currency.code !== code) {
    throw new CurrencyMismatchError(code, switching.currency.code);
  }
  if (switching.minorUnits < 0n) {
    throw new FinancialInputError('INVALID_CHARGES', 'Switching costs must be non-negative.');
  }
  if (input.opportunityRate.lessThanOrEqualTo(ONE.negated())) {
    throw new FinancialInputError(
      'RATE_OUT_OF_DOMAIN',
      'The opportunity rate must be above −100 %.',
    );
  }
  if (input.inputTruth.includes('GENERATED_NARRATIVE')) {
    // Constitution §4.2: model output never feeds financial truth.
    throw new FinancialInputError(
      'UNTRUSTED_INPUT',
      'A GENERATED_NARRATIVE value cannot be an input to a formula.',
    );
  }

  const current = sideFlows(input.balance, input.current);
  const offer = sideFlows(input.balance, input.offer);
  const sum = (values: readonly bigint[]): bigint => values.reduce((a, b) => a + b, 0n);
  const totalCurrent = sum(current);
  const totalOffer = sum(offer) + switching.minorUnits;

  const pvSavings = presentValue(current, input.opportunityRate)
    .minus(presentValue(offer, input.opportunityRate))
    .minus(decimal(switching.minorUnits));

  let breakEvenMonth: number | null = null;
  let cumulative = 0n;
  for (let k = 0; k < Math.max(current.length, offer.length); k += 1) {
    cumulative += (current[k] ?? 0n) - (offer[k] ?? 0n);
    if (cumulative >= switching.minorUnits) {
      breakEvenMonth = k + 1;
      break;
    }
  }

  const first = (values: readonly bigint[]): bigint => values[0] ?? 0n;
  const delta = first(offer) - first(current);
  const money = (value: bigint): Money => Money.fromMinorUnits(value, code);

  return {
    formula: { formulaId: 'credit.compare_refinance', version: 1 },
    currentInstalment: money(first(current)),
    offerInstalment: money(first(offer)),
    instalmentDelta: money(delta),
    totalCurrent: money(totalCurrent),
    totalOffer: money(totalOffer),
    nominalSavings: money(totalCurrent - totalOffer),
    pvSavings: money(BigInt(roundDecimal(pvSavings, 0, 'HALF_EVEN').toFixed(0))),
    breakEvenMonth,
    longerTermAlert: delta < 0n && totalOffer > totalCurrent,
    truthClass: input.inputTruth.includes('ESTIMATED') ? 'ESTIMATED' : 'DERIVED_DETERMINISTIC',
  };
}
