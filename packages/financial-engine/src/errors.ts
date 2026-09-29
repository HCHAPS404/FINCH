/**
 * Domain errors raised by formulas when an input is outside the formula's domain.
 *
 * Codes are stable (they appear in golden vectors and are mapped by the API to
 * `FINCH_FINANCIAL_<code>`, README §58). A formula never returns a partially valid
 * number: it either computes the whole result or throws one of these.
 */
export const FINANCIAL_INPUT_ERROR_CODES = [
  /** A rate outside the formula's mathematical domain (e.g. in advance ≥ 100 %, negative). */
  'RATE_OUT_OF_DOMAIN',
  /** A rate quote that is malformed or uses an unsupported compounding frequency. */
  'UNSUPPORTED_QUOTE',
  /** A term that is not a positive integer within the supported range. */
  'INVALID_TERM',
  /** A principal that is not strictly positive. */
  'INVALID_PRINCIPAL',
  /**
   * The rounded instalment would repay the principal before the last period, so the
   * schedule cannot be expressed in whole minor units (amounts too small for the term).
   */
  'UNAMORTIZABLE_IN_MINOR_UNITS',
  /** A charge (fee, insurance, upfront cost) that is negative, or upfront costs ≥ principal. */
  'INVALID_CHARGES',
  /** The internal rate of return could not be bracketed (no sign change in the NPV). */
  'IRR_NOT_FOUND',
  /** A date that is not a real calendar date in `YYYY-MM-DD` form. */
  'INVALID_DATE',
  /** A validity period that ends before it starts. */
  'INVALID_VALIDITY_PERIOD',
] as const;

export type FinancialInputErrorCode = (typeof FINANCIAL_INPUT_ERROR_CODES)[number];

export class FinancialInputError extends Error {
  readonly code: FinancialInputErrorCode;

  constructor(code: FinancialInputErrorCode, message: string) {
    super(message);
    this.name = 'FinancialInputError';
    this.code = code;
  }
}
