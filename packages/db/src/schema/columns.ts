/**
 * Shared column builders and enums — README §8.6, §11, §14.1, §24.
 *
 * Money is always two columns: a signed `bigint` of ISO 4217 minor units and a
 * three-letter currency code (Constitution §4.3). Rates are `numeric`, never float.
 * Enum values mirror @finch/contracts so the database and the code cannot drift.
 */
import { SOURCE_TYPES, TRUTH_CLASSES } from '@finch/contracts';
import { bigint, char, pgEnum, timestamp, uuid } from 'drizzle-orm/pg-core';

export const truthClass = pgEnum('truth_class', TRUTH_CLASSES);
export const sourceType = pgEnum('source_type', SOURCE_TYPES);

/** Rate quoting conventions (docs/financial-formulas/colombia-credit.md §1). */
export const rateConvention = pgEnum('rate_convention', [
  'EA', // effective annual
  'MV', // effective monthly, in arrears
  'NAMV', // nominal annual compounded monthly, in arrears
]);

// Private builders; the exported factories state their return type explicitly
// (explicit-module-boundary-types) by deriving it from the builder.
function idColumn() {
  return uuid().primaryKey().defaultRandom();
}
function createdAtColumn() {
  return timestamp({ withTimezone: true }).notNull().defaultNow();
}
function minorUnitsColumn() {
  return bigint({ mode: 'bigint' });
}
function currencyColumn() {
  return char({ length: 3 });
}

export const id = (): ReturnType<typeof idColumn> => idColumn();

export const createdAt = (): ReturnType<typeof createdAtColumn> => createdAtColumn();

/** Signed minor units. `mode: 'bigint'` so values never pass through a JS number. */
export const minorUnits = (): ReturnType<typeof minorUnitsColumn> => minorUnitsColumn();

/** ISO 4217 code; format enforced by a CHECK on each table that uses it. */
export const currency = (): ReturnType<typeof currencyColumn> => currencyColumn();
