/**
 * rate.convert@1 — interest-rate conversion between quoting conventions.
 * Spec: docs/financial-formulas/colombia-credit.md §1.
 *
 * A quote is `BASIS/PERIODS/TIMING`:
 * - BASIS   `EFFECTIVE` (the rate applies per period) or `NOMINAL` (annual rate that is
 *           divided by PERIODS to obtain the periodic rate);
 * - PERIODS compounding periods per year, one of {1, 2, 4, 6, 12, 360, 365};
 * - TIMING  `ARREARS` (vencida) or `ADVANCE` (anticipada).
 *
 * Every conversion goes through the effective annual rate (EA), so a conversion is
 * exactly the composition of two documented steps and can be audited step by step.
 * Colombian names (EA, MV, NAMV…) are aliases defined here only as a convenience for
 * parsing; the formula itself knows nothing about a jurisdiction.
 */
import { decimal, type Decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';

export const SUPPORTED_PERIODS = [1, 2, 4, 6, 12, 360, 365] as const;
export type PeriodsPerYear = (typeof SUPPORTED_PERIODS)[number];

export interface RateQuote {
  readonly basis: 'EFFECTIVE' | 'NOMINAL';
  readonly periodsPerYear: PeriodsPerYear;
  readonly timing: 'ARREARS' | 'ADVANCE';
}

function quote(
  basis: RateQuote['basis'],
  periodsPerYear: PeriodsPerYear,
  timing: RateQuote['timing'],
): RateQuote {
  return Object.freeze({ basis, periodsPerYear, timing });
}

/** Common quote names used in Colombian credit documents. */
export const QUOTES = Object.freeze({
  /** Efectiva anual. */
  EA: quote('EFFECTIVE', 1, 'ARREARS'),
  /** Efectiva semestral. */
  ES: quote('EFFECTIVE', 2, 'ARREARS'),
  /** Efectiva trimestral. */
  ET: quote('EFFECTIVE', 4, 'ARREARS'),
  /** Mes vencido. */
  MV: quote('EFFECTIVE', 12, 'ARREARS'),
  /** Mes anticipado. */
  MA: quote('EFFECTIVE', 12, 'ADVANCE'),
  /** Nominal anual mes vencido. */
  NAMV: quote('NOMINAL', 12, 'ARREARS'),
  /** Nominal anual mes anticipado. */
  NAMA: quote('NOMINAL', 12, 'ADVANCE'),
  /** Nominal anual trimestre vencido. */
  NATV: quote('NOMINAL', 4, 'ARREARS'),
  /** Nominal anual semestre vencido. */
  NASV: quote('NOMINAL', 2, 'ARREARS'),
  /** Efectiva diaria (365). */
  ED: quote('EFFECTIVE', 365, 'ARREARS'),
});

export type QuoteName = keyof typeof QUOTES;

function isQuoteName(text: string): text is QuoteName {
  return Object.hasOwn(QUOTES, text);
}

function isSupportedPeriods(value: number): value is PeriodsPerYear {
  return (SUPPORTED_PERIODS as readonly number[]).includes(value);
}

/** Parse a quote name (`MV`) or the explicit form (`NOMINAL/12/ARREARS`). */
export function parseQuote(text: string): RateQuote {
  if (isQuoteName(text)) return QUOTES[text];
  const parts = text.split('/');
  const [basis, periods, timing] = parts;
  if (
    parts.length !== 3 ||
    (basis !== 'EFFECTIVE' && basis !== 'NOMINAL') ||
    (timing !== 'ARREARS' && timing !== 'ADVANCE') ||
    periods === undefined ||
    !/^\d+$/.test(periods)
  ) {
    throw new FinancialInputError(
      'UNSUPPORTED_QUOTE',
      `'${text}' is not a rate quote. Expected a name (${Object.keys(QUOTES).join(', ')}) ` +
        'or BASIS/PERIODS/TIMING, e.g. NOMINAL/12/ARREARS.',
    );
  }
  const m = Number(periods);
  if (!isSupportedPeriods(m)) {
    throw new FinancialInputError(
      'UNSUPPORTED_QUOTE',
      `Compounding frequency ${periods} is not supported; use one of ${SUPPORTED_PERIODS.join(', ')}.`,
    );
  }
  return quote(basis, m, timing);
}

export interface ConvertRateOptions {
  /**
   * Negative rates are outside version 1's default domain (spec §1: "allowed only with
   * an explicit flag"). Even when allowed, a periodic rate must stay above −100 %.
   */
  readonly allowNegative?: boolean;
}

const ONE = decimal('1');

function outOfDomain(message: string): FinancialInputError {
  return new FinancialInputError('RATE_OUT_OF_DOMAIN', message);
}

/** Step 1: any quote → effective annual rate. */
function toEffectiveAnnual(rate: Decimal, from: RateQuote): Decimal {
  const m = from.periodsPerYear;
  let periodic = from.basis === 'NOMINAL' ? rate.dividedBy(m) : rate;
  if (from.timing === 'ADVANCE') {
    if (periodic.greaterThanOrEqualTo(ONE)) {
      throw outOfDomain(
        'A rate paid in advance of 100 % or more per period has no in-arrears equivalent.',
      );
    }
    // i_v = i_a / (1 − i_a)
    periodic = periodic.dividedBy(ONE.minus(periodic));
  }
  if (periodic.lessThanOrEqualTo(ONE.negated())) {
    throw outOfDomain('A periodic rate of −100 % or less is not a rate.');
  }
  // EA = (1 + i_p)^m − 1 (integer power: exact up to the working precision)
  return ONE.plus(periodic).pow(m).minus(ONE);
}

/** Step 2: effective annual rate → any quote. */
function fromEffectiveAnnual(ea: Decimal, to: RateQuote): Decimal {
  const m = to.periodsPerYear;
  // i_p = (1 + EA)^(1/m) − 1
  let periodic = m === 1 ? ea : ONE.plus(ea).pow(ONE.dividedBy(m)).minus(ONE);
  if (to.timing === 'ADVANCE') {
    // i_a = i_v / (1 + i_v)
    periodic = periodic.dividedBy(ONE.plus(periodic));
  }
  // N = i_p · m
  return to.basis === 'NOMINAL' ? periodic.times(m) : periodic;
}

/**
 * Convert `rate` (a fraction: 0.023 = 2.3 %) quoted as `from` into the `to` quote.
 * The result carries the working precision (40 significant digits); rounding for
 * display is the caller's explicit decision.
 */
export function convertRate(
  rate: Decimal,
  from: RateQuote,
  to: RateQuote,
  options: ConvertRateOptions = {},
): Decimal {
  if (rate.isNegative() && !rate.isZero() && options.allowNegative !== true) {
    throw outOfDomain('Negative rates require the explicit allowNegative flag (spec §1).');
  }
  if (
    from.basis === to.basis &&
    from.periodsPerYear === to.periodsPerYear &&
    from.timing === to.timing
  ) {
    // Validate the domain even for the identity, so the same input never passes in one
    // direction and fails in another.
    toEffectiveAnnual(rate, from);
    return rate;
  }
  return fromEffectiveAnnual(toEffectiveAnnual(rate, from), to);
}
