/**
 * amortization.french@1 — fixed-instalment (French system) amortization schedule.
 * Spec: docs/financial-formulas/colombia-credit.md §2.
 *
 *   C = P · i / (1 − (1 + i)^(−n))        (C = P / n when i = 0)
 *
 * Amounts are integers in minor units. Rounding is explicit and HALF_EVEN in exactly two
 * places: the instalment C, and each period's interest. The last period pays the
 * remaining balance plus its interest, so the schedule always ends at a zero balance
 * and the principal repaid equals the principal lent, to the minor unit.
 */
import { decimal, roundDecimal, type Decimal } from '../decimal.js';
import { FinancialInputError } from '../errors.js';
import { Money } from '../money.js';

/** Longest supported term: 100 years of monthly instalments. */
export const MAX_PERIODS = 1200;

export interface FrenchAmortizationInput {
  readonly principal: Money;
  /** Effective rate per period, as a fraction (0.016 = 1.6 % per period). */
  readonly periodicRate: Decimal;
  readonly periods: number;
}

export interface FrenchScheduleRow {
  /** 1-based period number. */
  readonly period: number;
  readonly payment: Money;
  readonly interest: Money;
  readonly principal: Money;
  /** Outstanding balance after this period's payment. */
  readonly balance: Money;
}

export interface FrenchAmortizationResult {
  readonly formula: { readonly formulaId: 'amortization.french'; readonly version: 1 };
  /** The rounded fixed instalment paid in every period except possibly the last. */
  readonly instalment: Money;
  readonly schedule: readonly FrenchScheduleRow[];
  readonly totalInterest: Money;
  readonly totalPaid: Money;
}

function roundToMinor(value: Decimal): bigint {
  return BigInt(roundDecimal(value, 0, 'HALF_EVEN').toFixed(0));
}

export function frenchAmortization(input: FrenchAmortizationInput): FrenchAmortizationResult {
  const { principal, periodicRate: i, periods: n } = input;
  const code = principal.currency.code;

  if (!Number.isInteger(n) || n < 1 || n > MAX_PERIODS) {
    throw new FinancialInputError(
      'INVALID_TERM',
      `The term must be an integer between 1 and ${MAX_PERIODS} periods, received ${String(n)}.`,
    );
  }
  if (principal.minorUnits <= 0n) {
    throw new FinancialInputError('INVALID_PRINCIPAL', 'The principal must be positive.');
  }
  if (i.isNegative() && !i.isZero()) {
    throw new FinancialInputError(
      'RATE_OUT_OF_DOMAIN',
      'amortization.french@1 does not support negative rates.',
    );
  }

  const p = decimal(principal.minorUnits);
  const one = decimal('1');
  const exact = i.isZero() ? p.dividedBy(n) : p.times(i).dividedBy(one.minus(one.plus(i).pow(-n)));
  const instalment = roundToMinor(exact);

  const schedule: FrenchScheduleRow[] = [];
  let balance = principal.minorUnits;
  let totalInterest = 0n;
  let totalPaid = 0n;
  for (let k = 1; k <= n; k += 1) {
    const interest = roundToMinor(decimal(balance).times(i));
    const principalPart = k === n ? balance : instalment - interest;
    const payment = principalPart + interest;
    if (principalPart > balance) {
      throw new FinancialInputError(
        'UNAMORTIZABLE_IN_MINOR_UNITS',
        `The rounded instalment repays the principal before period ${n}; the amount is too ` +
          'small for this term in whole minor units.',
      );
    }
    balance -= principalPart;
    totalInterest += interest;
    totalPaid += payment;
    schedule.push({
      period: k,
      payment: Money.fromMinorUnits(payment, code),
      interest: Money.fromMinorUnits(interest, code),
      principal: Money.fromMinorUnits(principalPart, code),
      balance: Money.fromMinorUnits(balance, code),
    });
  }

  return {
    formula: { formulaId: 'amortization.french', version: 1 },
    instalment: Money.fromMinorUnits(instalment, code),
    schedule,
    totalInterest: Money.fromMinorUnits(totalInterest, code),
    totalPaid: Money.fromMinorUnits(totalPaid, code),
  };
}
