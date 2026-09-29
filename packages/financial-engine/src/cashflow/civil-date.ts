/**
 * Civil (calendar) dates as day numbers — no `Date`, no time zone, no clock.
 *
 * A cash-flow date is a calendar day in the user's jurisdiction, not an instant, so the
 * engine never converts through UTC or local time (a classic off-by-one source). Day
 * numbers count days since 1970-01-01 in the proleptic Gregorian calendar, using
 * Howard Hinnant's `days_from_civil` / `civil_from_days` algorithms.
 */
import { FinancialInputError } from '../errors.js';

const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

function daysInMonth(year: number, month: number): number {
  const leap = (year % 4 === 0 && year % 100 !== 0) || year % 400 === 0;
  return [31, leap ? 29 : 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31][month - 1] ?? 0;
}

/** `YYYY-MM-DD` → day number. Rejects anything that is not a real calendar date. */
export function toDayNumber(iso: string): number {
  const [, ys, ms, ds] = ISO_DATE.exec(iso) ?? [];
  const year = Number(ys);
  const month = Number(ms);
  const day = Number(ds);
  if (ys === undefined || month < 1 || month > 12 || day < 1 || day > daysInMonth(year, month)) {
    throw new FinancialInputError('INVALID_DATE', `'${iso}' is not a calendar date YYYY-MM-DD.`);
  }
  const y = month <= 2 ? year - 1 : year;
  const era = Math.floor(y / 400);
  const yoe = y - era * 400;
  const doy = Math.floor((153 * (month + (month > 2 ? -3 : 9)) + 2) / 5) + day - 1;
  const doe = yoe * 365 + Math.floor(yoe / 4) - Math.floor(yoe / 100) + doy;
  return era * 146097 + doe - 719468;
}

/** Day number → `YYYY-MM-DD`. */
export function toIsoDate(dayNumber: number): string {
  const z = dayNumber + 719468;
  const era = Math.floor(z / 146097);
  const doe = z - era * 146097;
  const yoe = Math.floor(
    (doe - Math.floor(doe / 1460) + Math.floor(doe / 36524) - Math.floor(doe / 146096)) / 365,
  );
  const doy = doe - (365 * yoe + Math.floor(yoe / 4) - Math.floor(yoe / 100));
  const mp = Math.floor((5 * doy + 2) / 153);
  const day = doy - Math.floor((153 * mp + 2) / 5) + 1;
  const month = mp < 10 ? mp + 3 : mp - 9;
  const year = yoe + era * 400 + (month <= 2 ? 1 : 0);
  const pad = (n: number, width: number): string => String(n).padStart(width, '0');
  return `${pad(year, 4)}-${pad(month, 2)}-${pad(day, 2)}`;
}

/** ISO weekday: Monday = 1 … Sunday = 7. 1970-01-01 was a Thursday (4). */
export function isoWeekday(dayNumber: number): number {
  return ((((dayNumber + 3) % 7) + 7) % 7) + 1;
}
