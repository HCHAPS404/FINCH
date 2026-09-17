/**
 * Stable error taxonomy — README §58, §119.
 *
 * Error codes are part of the public API contract. Mobile clients outlive backend
 * versions (README §59), so a code that ships is a code we keep. Raw provider errors
 * are never surfaced to users (§119).
 */

export const ERROR_NAMESPACES = [
  'AUTH',
  'AUTHZ',
  'CONSENT',
  'VALIDATION',
  'FINANCIAL',
  'PROVIDER',
  'DOCUMENT',
  'ACTION',
  'PAYMENT',
  'RATE_LIMIT',
  'INTERNAL',
] as const;

export type ErrorNamespace = (typeof ERROR_NAMESPACES)[number];

export type FinchErrorCode = `FINCH_${ErrorNamespace}_${string}`;

/** The wire shape returned by every failing endpoint (README §58). */
export interface FinchErrorBody {
  readonly error: {
    readonly code: FinchErrorCode;
    /** User-facing, localized, never containing internals or provider text. */
    readonly message: string;
    /** Ties the response to logs and traces without exposing internals (§121). */
    readonly correlationId: string;
    readonly details?: readonly { readonly field: string; readonly issue: string }[];
  };
}

/** HTTP status mapping kept in one place so it cannot drift per-controller. */
export const NAMESPACE_HTTP_STATUS: Readonly<Record<ErrorNamespace, number>> = {
  AUTH: 401,
  AUTHZ: 403,
  CONSENT: 403,
  VALIDATION: 400,
  FINANCIAL: 422,
  PROVIDER: 502,
  DOCUMENT: 422,
  ACTION: 409,
  PAYMENT: 409,
  RATE_LIMIT: 429,
  INTERNAL: 500,
};
