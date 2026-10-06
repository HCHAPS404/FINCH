/**
 * Id generator port — README §60's reasoning applied to identifiers, not just time.
 *
 * A freshly-created Principal/Party/Workspace/Debt/Card/Document needs an id before
 * it has anything else to derive one from. Calling a real random source directly from
 * the domain would be exactly the ambient non-determinism `Clock` exists to avoid.
 * The real implementation (`crypto.randomUUID()`-backed) lives at the composition
 * root in `apps/api` — this package stays free of Node-specific globals, same as
 * every other pure package here (none of them carry `@types/node`).
 */

export interface IdGenerator {
  next(prefix: string): string;
}

/** Deterministic generator for tests — same prefix always advances a counter, not random. */
export function sequentialIdGenerator(): IdGenerator {
  const counters = new Map<string, number>();
  return {
    next: (prefix: string): string => {
      const n = (counters.get(prefix) ?? 0) + 1;
      counters.set(prefix, n);
      return `${prefix}-${n}`;
    },
  };
}
