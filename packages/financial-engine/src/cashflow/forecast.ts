/**
 * cashflow.forecast_30d@1 — 30-day end-of-day balance projection.
 * Spec: docs/financial-formulas/colombia-credit.md §7.
 *
 *   balance_d = balance_{d−1} + income_d − obligations_d,   d = today .. today + 30
 *
 * `startingBalance` is the balance before today's events; each series point is an
 * end-of-day balance. The calendar (weekend days and holidays) is a jurisdiction
 * parameter supplied by the caller from `jurisdictions/<CC>/calendar` with its source;
 * the engine hard-codes no country's holidays (README §36).
 *
 * A variable income is taken at the conservative 25th percentile of its history by
 * nearest rank — the ⌈0.25·n⌉-th smallest observed value — so the estimate is always an
 * amount that actually happened and needs no rounding. Any variable income, or any
 * ESTIMATED input, makes the whole series ESTIMATED.
 */
import type { TruthClass } from '@finch/contracts';

import { FinancialInputError } from '../errors.js';
import { CurrencyMismatchError, Money } from '../money.js';
import { isoWeekday, toDayNumber, toIsoDate } from './civil-date.js';

export const FORECAST_HORIZON_DAYS = 30;

export type DateShift = 'NONE' | 'NEXT_BUSINESS_DAY' | 'PREVIOUS_BUSINESS_DAY';

export interface BusinessCalendar {
  /** ISO weekdays that are not business days (Colombia: [6, 7]). */
  readonly weekend: readonly number[];
  /** Holidays as `YYYY-MM-DD`. */
  readonly holidays: readonly string[];
}

interface EventBase {
  readonly id: string;
  readonly kind: 'INCOME' | 'OBLIGATION';
  /** Scheduled date, `YYYY-MM-DD`, before any business-day shift. */
  readonly date: string;
  readonly shift?: DateShift;
}

export type CashflowEvent =
  | (EventBase & { readonly amount: Money; readonly truthClass: TruthClass })
  /** Variable income: 3 to 6 past monthly amounts; projected at their 25th percentile. */
  | (EventBase & { readonly kind: 'INCOME'; readonly history: readonly Money[] });

export interface ForecastInput {
  /** The first day of the forecast, `YYYY-MM-DD`. The engine has no clock. */
  readonly today: string;
  readonly startingBalance: Money;
  readonly startingBalanceTruth: TruthClass;
  /** Minimum balance the user wants to keep (a CONSTRAINT memory). */
  readonly buffer: Money;
  readonly calendar: BusinessCalendar;
  readonly events: readonly CashflowEvent[];
}

export interface ForecastPoint {
  readonly date: string;
  readonly balance: Money;
}

export interface ForecastResult {
  readonly formula: { readonly formulaId: 'cashflow.forecast_30d'; readonly version: 1 };
  /** 31 end-of-day balances, today included. */
  readonly series: readonly ForecastPoint[];
  /** First day whose balance is below the buffer, and by how much. */
  readonly firstDeficit: { readonly date: string; readonly shortfall: Money } | null;
  /** Lowest balance (first occurrence). */
  readonly minimum: ForecastPoint;
  /** Effective (shifted) dates of income events inside the horizon, ascending, unique. */
  readonly incomeDates: readonly string[];
  readonly truthClass: 'DERIVED_DETERMINISTIC' | 'ESTIMATED';
}

function validateCalendar(calendar: BusinessCalendar): Set<number> {
  for (const day of calendar.weekend) {
    if (!Number.isInteger(day) || day < 1 || day > 7) {
      throw new FinancialInputError('INVALID_DATE', `Weekday ${String(day)} is not ISO 1..7.`);
    }
  }
  if (calendar.weekend.length >= 7) {
    throw new FinancialInputError('INVALID_DATE', 'A calendar needs at least one business day.');
  }
  return new Set(calendar.holidays.map(toDayNumber));
}

function shiftDate(
  day: number,
  rule: DateShift,
  calendar: BusinessCalendar,
  holidays: Set<number>,
): number {
  const step = rule === 'NEXT_BUSINESS_DAY' ? 1 : rule === 'PREVIOUS_BUSINESS_DAY' ? -1 : 0;
  let current = day;
  // Terminates: at least one weekday is a business day and the holiday list is finite.
  while (step !== 0 && (calendar.weekend.includes(isoWeekday(current)) || holidays.has(current))) {
    current += step;
  }
  return current;
}

/** Nearest-rank 25th percentile: the ⌈0.25·n⌉-th smallest value. */
export function conservativeIncome(history: readonly Money[]): Money {
  if (history.length < 3 || history.length > 6) {
    throw new FinancialInputError(
      'INVALID_INCOME_HISTORY',
      'A variable income needs 3 to 6 past amounts (spec §7).',
    );
  }
  const ordered = [...history].sort((a, b) =>
    a.minorUnits < b.minorUnits ? -1 : a.minorUnits > b.minorUnits ? 1 : 0,
  );
  const picked = ordered[Math.ceil(history.length / 4) - 1];
  if (picked === undefined) throw new Error('unreachable: rank within 1..n');
  return picked;
}

export function forecast30d(input: ForecastInput): ForecastResult {
  const code = input.startingBalance.currency.code;
  const today = toDayNumber(input.today);
  const holidays = validateCalendar(input.calendar);
  if (input.buffer.currency.code !== code) {
    throw new CurrencyMismatchError(code, input.buffer.currency.code);
  }
  if (input.buffer.minorUnits < 0n) {
    throw new FinancialInputError('INVALID_CHARGES', 'The buffer must be non-negative.');
  }

  const truths: TruthClass[] = [input.startingBalanceTruth];
  const delta = new Array<bigint>(FORECAST_HORIZON_DAYS + 1).fill(0n);
  const incomeDays: number[] = [];

  for (const event of input.events) {
    const isVariable = 'history' in event;
    const amount = isVariable ? conservativeIncome(event.history) : event.amount;
    const amounts = isVariable ? event.history : [event.amount];
    for (const value of amounts) {
      if (value.currency.code !== code) throw new CurrencyMismatchError(code, value.currency.code);
      if (value.minorUnits < 0n) {
        throw new FinancialInputError(
          'INVALID_CHARGES',
          `Event '${event.id}' has a negative amount.`,
        );
      }
    }
    const day = shiftDate(toDayNumber(event.date), event.shift ?? 'NONE', input.calendar, holidays);
    const offset = day - today;
    if (offset < 0 || offset > FORECAST_HORIZON_DAYS) continue;
    truths.push(isVariable ? 'ESTIMATED' : event.truthClass);
    delta[offset] =
      (delta[offset] ?? 0n) + (event.kind === 'INCOME' ? amount.minorUnits : -amount.minorUnits);
    if (event.kind === 'INCOME') incomeDays.push(day);
  }

  if (truths.includes('GENERATED_NARRATIVE')) {
    throw new FinancialInputError(
      'UNTRUSTED_INPUT',
      'A GENERATED_NARRATIVE value cannot be an input to a formula.',
    );
  }

  const series: ForecastPoint[] = [];
  let balance = input.startingBalance.minorUnits;
  for (let k = 0; k <= FORECAST_HORIZON_DAYS; k += 1) {
    balance += delta[k] ?? 0n;
    series.push({ date: toIsoDate(today + k), balance: Money.fromMinorUnits(balance, code) });
  }

  const deficit = series.find((p) => p.balance.minorUnits < input.buffer.minorUnits);
  let minimum = series[0];
  for (const point of series) {
    if (minimum === undefined || point.balance.minorUnits < minimum.balance.minorUnits)
      minimum = point;
  }
  if (minimum === undefined) throw new Error('unreachable: the series has 31 points');

  return {
    formula: { formulaId: 'cashflow.forecast_30d', version: 1 },
    series,
    firstDeficit:
      deficit === undefined
        ? null
        : {
            date: deficit.date,
            shortfall: Money.fromMinorUnits(
              input.buffer.minorUnits - deficit.balance.minorUnits,
              code,
            ),
          },
    minimum,
    incomeDates: [...new Set(incomeDays)].sort((a, b) => a - b).map(toIsoDate),
    truthClass: truths.includes('ESTIMATED') ? 'ESTIMATED' : 'DERIVED_DETERMINISTIC',
  };
}
