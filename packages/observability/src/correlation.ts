/**
 * Correlation propagation — README §46, §21.2.
 *
 * `correlationId` is constant across a whole user-visible operation; `causationId`
 * names the event that caused this one. Threading both through every function
 * signature between an HTTP handler and a worker three hops away is how they get
 * silently dropped, so they live in `AsyncLocalStorage` instead and are read back by
 * whatever logs or emits an event without the caller needing to pass them explicitly.
 */
import { AsyncLocalStorage } from 'node:async_hooks';
import { randomUUID } from 'node:crypto';

export interface CorrelationContext {
  /** Constant across a whole user-visible operation (README §21.2). */
  readonly correlationId: string;
  /** The id of the event/request that caused this one, or null for the first. */
  readonly causationId: string | null;
}

const storage = new AsyncLocalStorage<CorrelationContext>();

export function newCorrelationId(): string {
  return randomUUID();
}

/** Runs `fn` with a correlation context available to any nested call. */
export function runWithCorrelation<T>(context: CorrelationContext, fn: () => T): T {
  return storage.run(context, fn);
}

/** The active correlation context, or undefined outside any `runWithCorrelation` call. */
export function getCorrelationContext(): CorrelationContext | undefined {
  return storage.getStore();
}
