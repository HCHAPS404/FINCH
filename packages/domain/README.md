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

## Does not own

- Authorization decisions — `can(principal, action, resource, workspace, context)`
  lives in `@finch/authorization`; this package only models what a Membership *is*.
- Persistence — schema and queries live in `@finch/db`. This package never imports a
  database driver (`domain-is-framework-free`, `.dependency-cruiser.cjs`).
- Financial mathematics — that is `@finch/financial-engine`.
- Vendor-shaped identity/session concerns (tokens, OIDC claims) — those belong to an
  adapter in the composition root that consumes a domain-defined port, once one exists.

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
grant denied / revoked member denied / other workspace denied) at the entity level. See
`@finch/authorization` for the relational policy tests once that package exists.

## Unblocked by

FIN-017, FIN-018, FIN-019, FIN-020
