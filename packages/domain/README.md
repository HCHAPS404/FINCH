# @finch/domain

Domain entities, value objects and invariants. Framework-free. README §8, §20, §60.

## Responsibility

The Principal/Party/Workspace/Membership identity and tenancy model (README §8), its
invariants, and the injectable `Clock` port (README §60) that keeps every calculation
built on it reproducible.

## Owns

- `Clock` — the only sanctioned source of "now" for pure layers.
- `Principal`, `Party`, `Workspace`, `Membership` entities and their construction
  invariants (README §8.6).
- `membershipGrants` / `revokeMembership` — the domain-level half of the README §9
  authorization harness (revocation semantics, capability matching).
- `AuthSessionPort` — the shape of a verified session, deliberately vendor-silent since
  ADR-0015 (identity provider) is still Proposed. `isSessionExpired` and
  `isAuthSandboxEligible` are the pure logic around it.
- `EventPublisher` — the port `apps/worker` publishes outbox rows through.

## Does not own

- Authorization decisions — `can(principal, action, resource, workspace, context)`
  lives in `@finch/authorization`; this package only models what a Membership *is*.
- Persistence — schema and queries live in `@finch/db`. This package never imports a
  database driver (`domain-is-framework-free`, `.dependency-cruiser.cjs`).
- Financial mathematics — that is `@finch/financial-engine`.
- Concrete, vendor-shaped implementations of `AuthSessionPort` or `EventPublisher`
  (OIDC verification, SQS/EventBridge publishing) — those are adapters at a
  composition root (`apps/api/src/infrastructure/**`, `apps/worker`), never here.

## Invariants

- No framework, infrastructure or vendor SDK import (`domain-is-framework-free`,
  `domain-does-not-import-adapters`).
- No ambient time or randomness — `Date.now()` and `Math.random()` are ESLint errors in
  this package; inject `Clock` instead (README §60, Constitution §4.5).
- Every tenant-owned resource has a `workspaceId`; a `Workspace` is never derived from
  an email or other external identifier (README §8.6).
- A `Membership` always carries at least one capability — access is granted explicitly,
  never implicitly.
- A revoked `Membership` grants nothing, regardless of the capabilities it still lists.

## Failure modes

Entity constructors throw on structurally invalid input (empty id, empty capability
set) rather than returning a partially-valid object. There is no recovery path inside
the domain: the composition root decides what to do with a thrown error.

## Observability

None. This package emits no logs, traces or metrics — see `@finch/observability` and
the composition root that wires it in.

## Tests

`src/tenancy.test.ts` covers the README §9 harness (owner allowed / membership without
grant denied / revoked member denied / other workspace denied) at the entity level —
see `@finch/authorization` for the relational policy tests. `src/auth-session.test.ts`
covers session expiry and sandbox-environment eligibility.

## Unblocked by

FIN-017, FIN-018, FIN-019, FIN-020, FIN-021
