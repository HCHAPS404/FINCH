/**
 * Arbitrary-precision decimals for rates and intermediate values — README §14.1, ADR-0016.
 *
 * Settled amounts are `Money` (bigint minor units). Everything that is not a settled
 * amount — interest rates, compounding factors, fractional powers such as
 * `(1 + EA)^(1/12)`, IRR iterations — uses this module.
 *
 * Library: decimal.js 10.6.0 (MIT, no dependencies), chosen in task S0-13 because it
 * implements `pow` with non-integer exponents, `ln` and `exp` at configurable precision,
 * which rate conversion and IRR need (docs/financial-formulas/colombia-credit.md §1, §3).
 *
 * Rules enforced here:
 * - an isolated constructor (`Decimal.clone`), so no other code can change FINCH's
 *   precision or rounding by mutating the global decimal.js configuration;
 * - 40 significant digits for intermediates (the formula specs require ≥ 34);
 * - JS `number` is not accepted: a rate typed as `0.023` has already been through binary
 *   floating point. Values enter as strings or bigints;
 * - rounding back to money is always explicit (`RoundingMode`), never implied.
 */
import { Decimal as DecimalJs } from 'decimal.js';

import { getCurrency } from './currency.js';
import { Money, type RoundingMode } from './money.js';

export const DECIMAL_PRECISION = 40;

const FinDecimal = DecimalJs.clone({
  precision: DECIMAL_PRECISION,
  rounding: DecimalJs.ROUND_HALF_EVEN,
  // Never switch to exponential notation for the magnitudes finance uses.
  toExpNeg: -60,
  toExpPos: 60,
  crypto: false,
});

/** An arbitrary-precision decimal created by this module. */
export type Decimal = InstanceType<typeof FinDecimal>;

const DECIMAL_STRING = /^-?\d+(\.\d+)?$/;

/**
 * Create a decimal from an exact textual or integer value.
 *
 * Accepts plain decimal strings (`"2.3"`, `"-0.015"`), bigints and existing decimals.
 * Rejects exponent notation, `NaN`, `Infinity`, locale formats (`"2,3"`) and `number`.
 */
export function decimal(value: string | bigint | Decimal): Decimal {
  if (typeof value === 'bigint') return new FinDecimal(value.toString());
  if (typeof value !== 'string') return new FinDecimal(value);
  if (!DECIMAL_STRING.test(value)) {
    throw new RangeError(
      `'${value}' is not a plain decimal. Parse locale formats (e.g. "2,3 %") into ` +
        '"2.3" at the boundary; FINCH never guesses number formats in the engine.',
    );
  }
  return new FinDecimal(value);
}

const ROUNDING: Readonly<Record<RoundingMode, DecimalJs.Rounding>> = {
  UP: DecimalJs.ROUND_UP,
  DOWN: DecimalJs.ROUND_DOWN,
  CEILING: DecimalJs.ROUND_CEIL,
  FLOOR: DecimalJs.ROUND_FLOOR,
  HALF_UP: DecimalJs.ROUND_HALF_UP,
  HALF_DOWN: DecimalJs.ROUND_HALF_DOWN,
  HALF_EVEN: DecimalJs.ROUND_HALF_EVEN,
};

/** Round to `places` decimal places with an explicit mode. */
export function roundDecimal(value: Decimal, places: number, mode: RoundingMode): Decimal {
  if (!Number.isInteger(places) || places < 0) {
    throw new RangeError(
      `Decimal places must be a non-negative integer, received ${String(places)}.`,
    );
  }
  return value.toDecimalPlaces(places, ROUNDING[mode]);
}

/** The exact decimal value of a Money amount (e.g. 12345 COP minor units → 123.45). */
export function moneyToDecimal(money: Money): Decimal {
  return new FinDecimal(money.minorUnits.toString()).dividedBy(
    new FinDecimal(10).pow(money.currency.exponent),
  );
}

/** Convert a decimal amount to Money, rounding to the currency's minor unit explicitly. */
export function decimalToMoney(value: Decimal, currencyCode: string, mode: RoundingMode): Money {
  const { exponent } = getCurrency(currencyCode);
  const minor = roundDecimal(value.times(new FinDecimal(10).pow(exponent)), 0, mode);
  return Money.fromMinorUnits(BigInt(minor.toFixed(0)), currencyCode);
}
