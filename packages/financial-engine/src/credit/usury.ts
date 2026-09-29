/**
 * credit.usury_check@1 — agreed remunerative rate versus the certified usury rate.
 * Spec: docs/financial-formulas/colombia-credit.md §4.
 *
 * Both rates are effective annual (convert first with rate.convert@1). The usury rate is
 * a jurisdiction parameter with provenance: the caller supplies its certification window
 * and the date being evaluated, so the check stays deterministic (no ambient clock) and a
 * ceiling used outside its window is reported as STALE instead of silently trusted.
 *
 * The result is a comparison, never a legal conclusion: which charges count for usury
 * purposes is a legal matter (spec §4, D-07), so the total cost (§3) is reported apart.
 */
import { decimal, type Decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';

export interface UsuryCheckInput {
  readonly agreedRateEA: Decimal;
  readonly usuryRateEA: Decimal;
  /** First day the certified usury rate applies, `YYYY-MM-DD`. */
  readonly validFrom: string;
  /** Last day the certified usury rate applies, `YYYY-MM-DD`. */
  readonly validTo: string;
  /** The date the credit is evaluated at, `YYYY-MM-DD`. */
  readonly asOf: string;
}

export interface UsuryCheckResult {
  readonly formula: { readonly formulaId: 'credit.usury_check'; readonly version: 1 };
  /** `AT_OR_ABOVE` includes equality: a rate equal to the ceiling is not below it. */
  readonly status: 'BELOW' | 'AT_OR_ABOVE';
  /** (agreed − usury) × 100, in percentage points, exact. Negative means headroom. */
  readonly marginPp: Decimal;
  /** `STALE` when `asOf` falls outside the certification window. */
  readonly sourceStatus: 'CURRENT' | 'STALE';
}

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Validates a real calendar date; returns it unchanged (ISO dates compare as strings). */
function isoDate(value: string, field: string): string {
  const match = ISO_DATE.exec(value);
  const [, y, m, d] = match ?? [];
  if (y !== undefined && m !== undefined && d !== undefined) {
    const year = Number(y);
    const month = Number(m);
    const day = Number(d);
    const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
    const days = [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1];
    if (days !== undefined && day >= 1 && day <= days) return value;
  }
  throw new FinancialInputError('INVALID_DATE', `${field} must be a calendar date YYYY-MM-DD.`);
}

export function usuryCheck(input: UsuryCheckInput): UsuryCheckResult {
  const { agreedRateEA: agreed, usuryRateEA: usury } = input;
  if ((agreed.isNegative() && !agreed.isZero()) || usury.lessThanOrEqualTo(0)) {
    throw new FinancialInputError(
      'RATE_OUT_OF_DOMAIN',
      'The agreed rate must be non-negative and the usury rate positive.',
    );
  }
  const validFrom = isoDate(input.validFrom, 'validFrom');
  const validTo = isoDate(input.validTo, 'validTo');
  const asOf = isoDate(input.asOf, 'asOf');
  if (validFrom > validTo) {
    throw new FinancialInputError(
      'INVALID_VALIDITY_PERIOD',
      'The usury certification period ends before it starts.',
    );
  }
  return {
    formula: { formulaId: 'credit.usury_check', version: 1 },
    status: agreed.lessThan(usury) ? 'BELOW' : 'AT_OR_ABOVE',
    marginPp: agreed.minus(usury).times(decimal('100')),
    sourceStatus: validFrom <= asOf && asOf <= validTo ? 'CURRENT' : 'STALE',
  };
}
