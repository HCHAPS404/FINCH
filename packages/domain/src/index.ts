/**
 * @finch/domain — entities, value objects and invariants.
 *
 * Depends only on @finch/contracts and @finch/financial-engine. It may not import
 * NestJS, React, Drizzle, cloud SDKs, LLM SDKs or observability SDKs — see
 * `domain-is-framework-free` and `domain-does-not-import-adapters` in
 * .dependency-cruiser.cjs.
 *
 * Ships the Clock port plus the Principal/Party/Workspace/Membership identity model
 * (README §8) and its invariants, together with the negative authorization tests
 * required by README §9. Authorization decisions, persistence and vendor-shaped
 * identity providers are out of scope here — see @finch/authorization and
 * @finch/db.
 */
export type { Clock } from './clock.js';
export { systemClock, fixedClock } from './clock.js';

export type { Principal } from './principal.js';
export { createPrincipal } from './principal.js';

export type { Party } from './party.js';
export { createParty } from './party.js';

export type { Workspace } from './workspace.js';
export { createWorkspace } from './workspace.js';

export type { Membership, MembershipStatus } from './membership.js';
export {
  MEMBERSHIP_STATUSES,
  createMembership,
  membershipGrants,
  revokeMembership,
} from './membership.js';
