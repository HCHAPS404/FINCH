/**
 * Unwraps the first row of an insert/update `.returning()` call. Writing to exactly
 * one row and getting none back means the database contradicted the query we just
 * issued — an invariant violation, not a client-facing 404.
 */
export function firstOrThrow<T>(rows: readonly T[]): T {
  const row = rows[0];
  if (row === undefined) {
    throw new Error('Expected at least one row from a write that targets exactly one row');
  }
  return row;
}
