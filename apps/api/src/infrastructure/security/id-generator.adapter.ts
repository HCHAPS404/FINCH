/**
 * Real `IdGenerator` — ADR-0041. `@finch/domain` owns the port plus
 * `sequentialIdGenerator` for tests; no package under `packages/` depends on
 * `@types/node`, so the `crypto.randomUUID()`-backed implementation lives here, at the
 * composition root, same split as `AuthSessionPort`/`DevAuthSessionAdapter`.
 */
import { randomUUID } from 'node:crypto';
import type { IdGenerator } from '@finch/domain';

export function systemIdGenerator(): IdGenerator {
  return {
    next: (prefix: string): string => `${prefix}-${randomUUID()}`,
  };
}
