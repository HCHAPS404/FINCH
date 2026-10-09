/**
 * `rate.convert@1` — docs/financial-formulas/colombia-credit.md §1. Rate conversions
 * (periodic ⇄ effective annual, nominal ⇄ periodic, anticipated ⇄ due) that everything
 * else in that document builds on (amortization, total cost, usury checks).
 *
 * Rates are `Decimal`, never a JS `number` or `Money` — they are dimensionless ratios,
 * not currency amounts, but ADR-0016 requires the same float-avoidance discipline:
 * only `Decimal.fromDecimalString`-style string construction crosses this module's
 * boundary. Precision is 34 significant digits (colombia-credit.md's own requirement),
 * on a cloned `Decimal` constructor so this module never mutates the shared global
 * `Decimal` config other code might rely on (ADR-0016 addendum, 2026-10-07).
 */
import { Decimal } from 'decimal.js';
import { registerFormula } from './formula-registry.js';

export const Rate = Decimal.clone({
  precision: 34,
  rounding: Decimal.ROUND_HALF_EVEN,
  // Wide enough that no rate magnitude this engine deals with falls back to
  // exponential notation in toString() — financial rates are never astronomically
  // large or small, so this is a formatting choice, not a precision one.
  toExpNeg: -40,
  toExpPos: 40,
});
export type RateValue = InstanceType<typeof Rate>;

export const PERIODS_PER_YEAR = [1, 2, 4, 6, 12, 360, 365] as const;
export type PeriodsPerYear = (typeof PERIODS_PER_YEAR)[number];

export interface RateConvertOptions {
  /** Negative rates are rejected unless the caller explicitly opts in. */
  readonly allowNegative?: boolean;
}

function parseRate(decimalString: string, options: RateConvertOptions | undefined): RateValue {
  // `new Rate(...)` itself throws a DecimalError for a malformed string — there is no
  // NaN-flagged Decimal to check for afterward, the way there would be for a number.
  const rate = new Rate(decimalString);
  if (rate.isNegative() && options?.allowNegative !== true) {
    throw new RangeError(
      `rate.convert@1: negative rate '${decimalString}' requires { allowNegative: true } ` +
        '— a negative rate is unusual enough that it must be opted into explicitly.',
    );
  }
  return rate;
}

function assertPeriods(periodsPerYear: number): asserts periodsPerYear is PeriodsPerYear {
  if (!PERIODS_PER_YEAR.includes(periodsPerYear as PeriodsPerYear)) {
    throw new RangeError(
      `rate.convert@1: periodsPerYear must be one of ${PERIODS_PER_YEAR.join(', ')}, ` +
        `received ${periodsPerYear}.`,
    );
  }
}

/** `EA = (1 + i_p)^m − 1` — periodic rate due at period-end, compounded to effective annual. */
export function periodicToEffectiveAnnual(
  periodicRate: string,
  periodsPerYear: number,
  options?: RateConvertOptions,
): string {
  assertPeriods(periodsPerYear);
  const i = parseRate(periodicRate, options);
  return i.plus(1).pow(periodsPerYear).minus(1).toString();
}

/** `i_p = (1 + EA)^(1/m) − 1` — the inverse of `periodicToEffectiveAnnual`. */
export function effectiveAnnualToPeriodic(
  effectiveAnnualRate: string,
  periodsPerYear: number,
  options?: RateConvertOptions,
): string {
  assertPeriods(periodsPerYear);
  const ea = parseRate(effectiveAnnualRate, options);
  return ea.plus(1).pow(new Rate(1).dividedBy(periodsPerYear)).minus(1).toString();
}

/** `i_p = N / m` — a nominal annual rate split evenly across its periods. */
export function nominalToPeriodic(
  nominalRate: string,
  periodsPerYear: number,
  options?: RateConvertOptions,
): string {
  assertPeriods(periodsPerYear);
  const n = parseRate(nominalRate, options);
  return n.dividedBy(periodsPerYear).toString();
}

/** `N = i_p · m` — the inverse of `nominalToPeriodic`. */
export function periodicToNominal(
  periodicRate: string,
  periodsPerYear: number,
  options?: RateConvertOptions,
): string {
  assertPeriods(periodsPerYear);
  const i = parseRate(periodicRate, options);
  return i.times(periodsPerYear).toString();
}

/** `i_v = i_a / (1 − i_a)` — anticipated to due (same period). Undefined at `i_a ≥ 1`. */
export function anticipatedToDue(anticipatedRate: string, options?: RateConvertOptions): string {
  const ia = parseRate(anticipatedRate, options);
  if (ia.greaterThanOrEqualTo(1)) {
    throw new RangeError(
      `rate.convert@1: an anticipated rate of ${anticipatedRate} is >= 1 — ` +
        '1 − i_a is zero or negative, so the due-rate conversion is undefined.',
    );
  }
  return ia.dividedBy(new Rate(1).minus(ia)).toString();
}

/** `i_a = i_v / (1 + i_v)` — the inverse of `anticipatedToDue`. Undefined at `i_v = −1`. */
export function dueToAnticipated(dueRate: string, options?: RateConvertOptions): string {
  const iv = parseRate(dueRate, options);
  if (iv.plus(1).isZero()) {
    throw new RangeError(
      `rate.convert@1: a due rate of ${dueRate} makes 1 + i_v zero — ` +
        'the anticipated-rate conversion is undefined.',
    );
  }
  return iv.dividedBy(iv.plus(1)).toString();
}

registerFormula({
  formulaId: 'rate.convert',
  version: 1,
  purpose:
    'Convert an interest rate between periodic/effective-annual, nominal/periodic, and ' +
    'anticipated/due representations — the primitive every other credit formula in ' +
    'colombia-credit.md builds on.',
  inputs: [
    { name: 'rate', unit: 'decimal string', description: 'A ratio, e.g. "0.023" for 2.3%.' },
    { name: 'periodsPerYear', unit: 'integer', description: 'One of 1, 2, 4, 6, 12, 360, 365.' },
    {
      name: 'allowNegative',
      unit: 'boolean',
      description: 'Must be true to pass a negative rate; false/absent rejects it.',
    },
  ],
  outputUnit: 'decimal string (34 significant digits, Decimal per ADR-0016 addendum)',
  rounding: 'Decimal.ROUND_HALF_EVEN at 34 significant digits throughout.',
  assumptions: [
    'Rates are ratios (0.023, not "2.3"), matching Decimal input and Money\'s own ' +
      'fromDecimalString philosophy of never accepting a pre-parsed JS number.',
    'periodsPerYear is restricted to the set colombia-credit.md §1 names; any other value is ' +
      'rejected rather than silently accepted.',
    'Negative rates are real (e.g. a subsidized or negative-real-rate product) but rare enough ' +
      'that a caller must opt in explicitly via allowNegative.',
  ],
  reference: 'docs/financial-formulas/colombia-credit.md §1.',
  edgeCases: [
    'anticipatedToDue at i_a >= 1 throws — 1 − i_a is zero or negative, division is undefined.',
    'dueToAnticipated at i_v = −1 throws — 1 + i_v is zero, division is undefined.',
    'A rate of exactly 0 round-trips through every conversion unchanged.',
    'A high rate (> 100% EA) is accepted — there is no upper bound in this formula; usury is a ' +
      'separate check (credit.usury_check@1, not yet implemented).',
  ],
  implementationPath: 'packages/financial-engine/src/rate-convert.ts',
  testVectors: [
    {
      description: '2.3% monthly (due) to EA, per the worked example in colombia-credit.md §1',
      inputs: { periodicRate: '0.023', periodsPerYear: '12' },
      expected: '0.313734498399602...(34 significant digits)',
    },
    {
      description: 'anticipatedToDue rejects i_a >= 1',
      inputs: { anticipatedRate: '1' },
      expected: 'throws RangeError',
    },
  ],
});
