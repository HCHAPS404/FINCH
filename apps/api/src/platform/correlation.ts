/**
 * Correlation IDs — README §46, §121.
 *
 * Every response carries `x-correlation-id`. A caller-supplied ID is accepted only if
 * it is a short opaque token; anything else is replaced, so a client cannot inject
 * log-forging text or a huge header into our logs and traces.
 */
import { randomUUID } from 'node:crypto';

export const CORRELATION_HEADER = 'x-correlation-id';

const SAFE_ID = /^[A-Za-z0-9-]{8,64}$/;

export function resolveCorrelationId(incoming: string | string[] | undefined): string {
  const candidate = Array.isArray(incoming) ? incoming[0] : incoming;
  return candidate !== undefined && SAFE_ID.test(candidate) ? candidate : randomUUID();
}
