/**
 * Money — README Constitution §4.3, §14.1.
 *
 *   "Money jamás usa floating point binario como representación financiera autoritativa."
 *
 * A settled amount is stored as a `bigint` count of minor units (centavos, cents).
 * This is exact: there is no value a currency can express that a bigint cannot hold,
 * and no accumulation of rounding drift across a million operations.
 *
 * The rules this module enforces, each of which is a real defect class in financial
 * software:
 *
 *   1. No implicit currency coercion. Adding COP to USD throws rather than silently
 *      producing a number that looks plausible.
 *   2. Rounding is always explicit. There is no default mode, because the "obvious"
 *      default differs between interest accrual, tax and payment splitting.
 *   3. Allocation conserves the total. Splitting 100 into three parts yields
 *      34 + 33 + 33, never 33 + 33 + 33 with a centavo silently destroyed.
 *   4. Money never leaves this module as a float. `toNumber()` does not exist; use
 *      `toDecimalString()` for display and `minorUnits` for storage.
 */

import { getCurrency, type Currency } from './currency.js';

/**
 * Rounding modes.
 *
 * HALF_EVEN (banker's rounding) is the default *recommendation* for interest and
 * repeated accrual because HALF_UP introduces a systematic upward bias over many
 * operations. It is still never applied implicitly — the caller states intent.
 */
export const ROUNDING_MODES = [
  'HALF_UP',
  'HALF_DOWN',
  'HALF_EVEN',
  'UP',
  'DOWN',
  'CEILING',
  'FLOOR',
] as const;

export type RoundingMode = (typeof ROUNDING_MODES)[number];

export class CurrencyMismatchError extends Error {
  constructor(left: string, right: string) {
    super(
      `Cannot combine ${left} with ${right}. FINCH never converts currency implicitly; ` +
        'apply an explicit FX rate with its own source and freshness (README §60).',
    );
    this.name = 'CurrencyMismatchError';
  }
}

/**
 * An exact monetary amount.
 *
 * Immutable: every operation returns a new instance. Financial code that mutates
 * amounts in place makes reproducing a historical decision (Constitution §4.5)
 * effectively impossible.
 */
export class Money {
  readonly minorUnits: bigint;
  readonly currency: Currency;

  private constructor(minorUnits: bigint, currency: Currency) {
    this.minorUnits = minorUnits;
    this.currency = currency;
    Object.freeze(this);
  }

  // -- Construction --------------------------------------------------------

  /** Construct from an exact count of minor units (centavos). The storage form. */
  static fromMinorUnits(minorUnits: bigint | number, currencyCode: string): Money {
    if (typeof minorUnits === 'number' && !Number.isInteger(minorUnits)) {
      throw new TypeError(
        `Minor units must be an integer, received ${String(minorUnits)}. A fractional ` +
          'minor unit means a rounding decision was skipped (README §14.1).',
      );
    }
    return new Money(BigInt(minorUnits), getCurrency(currencyCode));
  }

  /**
   * Parse a decimal string such as "1234.56".
   *
   * Deliberately accepts a string, not a number: `Money.fromDecimal(0.1 + 0.2)` would
   * receive 0.30000000000000004, and the error would already have happened before
   * this function was reached.
   */
  static fromDecimalString(value: string, currencyCode: string): Money {
    const currency = getCurrency(currencyCode);
    const trimmed = value.trim();

    const match = /^(-)?(\d+)(?:\.(\d+))?$/.exec(trimmed);
    if (match === null) {
      throw new TypeError(
        `'${value}' is not a valid decimal amount. Expected digits with an optional ` +
          'single decimal point, e.g. "1234.56".',
      );
    }

    const [, sign, whole = '0', fraction = ''] = match;

    if (fraction.length > currency.exponent) {
      throw new RangeError(
        `'${value}' has ${fraction.length} decimal places but ${currency.code} has ` +
          `${currency.exponent}. Round explicitly before constructing Money; FINCH does ` +
          'not silently truncate money (README §14.1).',
      );
    }

    const padded = fraction.padEnd(currency.exponent, '0');
    const magnitude = BigInt(`${whole}${padded}`);
    return new Money(sign === '-' ? -magnitude : magnitude, currency);
  }

  static zero(currencyCode: string): Money {
    return new Money(0n, getCurrency(currencyCode));
  }

  // -- Guards --------------------------------------------------------------

  private assertSameCurrency(other: Money): void {
    if (this.currency.code !== other.currency.code) {
      throw new CurrencyMismatchError(this.currency.code, other.currency.code);
    }
  }

  // -- Arithmetic ----------------------------------------------------------

  add(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.minorUnits + other.minorUnits, this.currency);
  }

  subtract(other: Money): Money {
    this.assertSameCurrency(other);
    return new Money(this.minorUnits - other.minorUnits, this.currency);
  }

  /** Scale by an exact integer factor. Always lossless, so no rounding mode needed. */
  multiplyByInteger(factor: bigint | number): Money {
    if (typeof factor === 'number' && !Number.isInteger(factor)) {
      throw new TypeError(
        'multiplyByInteger requires an integer. For a rate or percentage use ' +
          'multiplyByRatio, which forces you to declare a rounding mode.',
      );
    }
    return new Money(this.minorUnits * BigInt(factor), this.currency);
  }

  /**
   * Scale by the exact rational number `numerator / denominator`.
   *
   * Rates are expressed as a ratio rather than a decimal so the caller cannot smuggle
   * a float in. An interest rate of 12.75% is `multiplyByRatio(1275n, 10000n, mode)`.
   */
  multiplyByRatio(numerator: bigint, denominator: bigint, rounding: RoundingMode): Money {
    if (denominator === 0n) throw new RangeError('Denominator must not be zero.');
    return new Money(
      divideRounded(this.minorUnits * numerator, denominator, rounding),
      this.currency,
    );
  }

  /** Divide into an exact rational, with an explicit rounding decision. */
  divideByInteger(divisor: bigint | number, rounding: RoundingMode): Money {
    const d = BigInt(divisor);
    if (d === 0n) throw new RangeError('Cannot divide money by zero.');
    return new Money(divideRounded(this.minorUnits, d, rounding), this.currency);
  }

  negate(): Money {
    return new Money(-this.minorUnits, this.currency);
  }

  absolute(): Money {
    return new Money(this.minorUnits < 0n ? -this.minorUnits : this.minorUnits, this.currency);
  }

  // -- Allocation ----------------------------------------------------------

  /**
   * Split into parts proportional to `weights`, conserving the total exactly.
   *
   * The invariant `sum(allocate(w)) === this` holds for every input. Naive
   * proportional splitting loses or invents minor units — the classic "where did the
   * missing centavo go" defect. Remainders are distributed one minor unit at a time
   * to the largest weights first, which is deterministic and reproducible.
   */
  allocate(weights: readonly (bigint | number)[]): Money[] {
    if (weights.length === 0) throw new RangeError('allocate requires at least one weight.');

    const bigWeights = weights.map((w) => BigInt(w));
    if (bigWeights.some((w) => w < 0n)) {
      throw new RangeError('allocate weights must be non-negative.');
    }

    const totalWeight = bigWeights.reduce((sum, w) => sum + w, 0n);
    if (totalWeight === 0n) throw new RangeError('allocate weights must not sum to zero.');

    // Floor division first, then hand out the remainder deterministically.
    const shares = bigWeights.map((w) => (this.minorUnits * w) / totalWeight);
    const distributed = shares.reduce((sum, s) => sum + s, 0n);
    let remainder = this.minorUnits - distributed;

    // Largest weight first; ties broken by original index so the result is stable.
    const order = bigWeights
      .map((weight, index) => ({ weight, index }))
      .sort((a, b) => (b.weight === a.weight ? a.index - b.index : b.weight > a.weight ? 1 : -1));

    const step = remainder >= 0n ? 1n : -1n;
    let cursor = 0;
    while (remainder !== 0n) {
      const target = order[cursor % order.length];
      /* c8 ignore next */
      if (target === undefined) break;
      shares[target.index] = (shares[target.index] ?? 0n) + step;
      remainder -= step;
      cursor += 1;
    }

    return shares.map((s) => new Money(s, this.currency));
  }

  /** Split into `n` equal parts, conserving the total. */
  split(parts: number): Money[] {
    if (!Number.isInteger(parts) || parts < 1) {
      throw new RangeError('split requires a positive integer number of parts.');
    }
    return this.allocate(Array.from({ length: parts }, () => 1n));
  }

  // -- Comparison ----------------------------------------------------------

  equals(other: Money): boolean {
    return this.currency.code === other.currency.code && this.minorUnits === other.minorUnits;
  }

  /** -1 if this < other, 0 if equal, 1 if this > other. */
  compare(other: Money): -1 | 0 | 1 {
    this.assertSameCurrency(other);
    if (this.minorUnits < other.minorUnits) return -1;
    if (this.minorUnits > other.minorUnits) return 1;
    return 0;
  }

  isZero(): boolean {
    return this.minorUnits === 0n;
  }

  isNegative(): boolean {
    return this.minorUnits < 0n;
  }

  isPositive(): boolean {
    return this.minorUnits > 0n;
  }

  // -- Serialization -------------------------------------------------------

  /**
   * Exact decimal representation for display and transport, e.g. "-1234.56".
   *
   * There is intentionally no `toNumber()`. Returning a JS number would reintroduce
   * the exact defect this class exists to prevent, and it would do so at the boundary
   * where values are least likely to be re-checked.
   */
  toDecimalString(): string {
    const negative = this.minorUnits < 0n;
    const magnitude = (negative ? -this.minorUnits : this.minorUnits).toString();
    const { exponent } = this.currency;

    if (exponent === 0) return `${negative ? '-' : ''}${magnitude}`;

    const padded = magnitude.padStart(exponent + 1, '0');
    const whole = padded.slice(0, -exponent);
    const fraction = padded.slice(-exponent);
    return `${negative ? '-' : ''}${whole}.${fraction}`;
  }

  /** The wire shape. Amount stays a string so no JSON parser can turn it into a float. */
  toJSON(): { amount: string; currency: string; minorUnits: string } {
    return {
      amount: this.toDecimalString(),
      currency: this.currency.code,
      minorUnits: this.minorUnits.toString(),
    };
  }

  toString(): string {
    return `${this.toDecimalString()} ${this.currency.code}`;
  }
}

// ---------------------------------------------------------------------------
// Exact integer division with an explicit rounding mode.
// ---------------------------------------------------------------------------

/**
 * Divide two bigints, rounding the exact rational result per `mode`.
 *
 * Implemented with doubled remainders so the half-way comparison is exact; comparing
 * `remainder / divisor` against 0.5 in floating point would defeat the purpose of the
 * whole module.
 */
export function divideRounded(dividend: bigint, divisor: bigint, mode: RoundingMode): bigint {
  if (divisor === 0n) throw new RangeError('Division by zero.');

  // Normalize so the sign lives in one place and truncation behaves predictably.
  const negative = dividend < 0n !== divisor < 0n;
  const absDividend = dividend < 0n ? -dividend : dividend;
  const absDivisor = divisor < 0n ? -divisor : divisor;

  const quotient = absDividend / absDivisor;
  const remainder = absDividend % absDivisor;

  if (remainder === 0n) return negative ? -quotient : quotient;

  const twiceRemainder = remainder * 2n;
  let roundAway: boolean;

  switch (mode) {
    case 'DOWN':
      roundAway = false;
      break;
    case 'UP':
      roundAway = true;
      break;
    case 'FLOOR':
      roundAway = negative;
      break;
    case 'CEILING':
      roundAway = !negative;
      break;
    case 'HALF_UP':
      roundAway = twiceRemainder >= absDivisor;
      break;
    case 'HALF_DOWN':
      roundAway = twiceRemainder > absDivisor;
      break;
    case 'HALF_EVEN':
      roundAway =
        twiceRemainder > absDivisor || (twiceRemainder === absDivisor && quotient % 2n !== 0n);
      break;
  }

  const magnitude = roundAway ? quotient + 1n : quotient;
  return negative ? -magnitude : magnitude;
}

/** Sum a list of Money, requiring a currency so an empty list is still well-typed. */
export function sumMoney(values: readonly Money[], currencyCode: string): Money {
  return values.reduce((total, value) => total.add(value), Money.zero(currencyCode));
}
