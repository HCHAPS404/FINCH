/**
 * @finch/domain — entities, value objects and invariants.
 *
 * Depends only on @finch/contracts and @finch/financial-engine. It may not import
 * NestJS, React, Drizzle, cloud SDKs, LLM SDKs or observability SDKs — see
 * `domain-is-framework-free` and `domain-does-not-import-adapters` in
 * .dependency-cruiser.cjs.
 *
 * Foundation ships the Clock port and nothing else. Principal, Party, Workspace and
 * Membership arrive with FIN-017..FIN-020, together with their invariants and the
 * negative authorization tests required by README §9.
 */
export type { Clock } from './clock.js';
export { systemClock, fixedClock } from './clock.js';
