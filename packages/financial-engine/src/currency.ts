/**
 * Currency definitions — README §60.
 *
 * `exponent` is the ISO 4217 minor-unit exponent: the number of decimal places in the
 * currency's minor unit. It determines how a Money value is stored and printed, and
 * it is the reason Money cannot be a bare number: 1.10 USD is 110 minor units, and
 * `1.10` is not representable in binary floating point.
 *
 * Note on COP: ISO 4217 assigns Colombian pesos an exponent of 2. Colombian market
 * practice quotes whole pesos, but FINCH stores the ISO minor unit and handles
 * presentation separately — changing storage precision to match a display convention
 * would be an irreversible loss of information.
 */

export interface Currency {
  readonly code: string;
  readonly exponent: number;
  readonly name: string;
}

export const COP: Currency = { code: 'COP', exponent: 2, name: 'Colombian peso' };
export const USD: Currency = { code: 'USD', exponent: 2, name: 'United States dollar' };
export const EUR: Currency = { code: 'EUR', exponent: 2, name: 'Euro' };

export const CURRENCIES: Readonly<Record<string, Currency>> = { COP, USD, EUR };

export function getCurrency(code: string): Currency {
  const currency = CURRENCIES[code];
  if (currency === undefined) {
    throw new RangeError(
      `Unknown currency '${code}'. Add it to @finch/financial-engine/currency with its ` +
        'ISO 4217 exponent; FINCH never infers currency precision.',
    );
  }
  return currency;
}
