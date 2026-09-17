# @finch/db

Drizzle schema, migrations and seeds. The only package permitted to touch the database driver. README §24.

> **Status:** boundary only. No implementation yet — see _Unblocked by_ below.
> This file is the module contract required by README §98. It is written before the
> code so the package cannot quietly acquire responsibilities it was never meant to
> have.

## Responsibility

Drizzle schema, migrations and seeds. The only package permitted to touch the database driver. README §24.

## Owns

- Table definitions across the identity, security, finance, planning, decision, documents, actions, integration and audit schemas.
- Versioned migrations following expand -> migrate/backfill -> contract (§72).
- Synthetic Colombian seed personas (§80).
- The transactional outbox table (§21.1).

## Does not own

- Business rules — those live in @finch/domain.
- Financial mathematics — that is @finch/financial-engine.
- Cross-context queries; a module reads its own tables, and anything else goes through a documented read model (§20).

## Invariants

- Every tenant-owned table has a non-null workspace_id (§8.6).
- Migrations are expand-only in a single step; destructive changes are split across releases (§72).
- An outbox row is written in the SAME transaction as the state change it describes (§21.1).
- Seeds contain synthetic data only. Production data never reaches a developer machine (Constitution §4.18).

## Failure modes

To be documented alongside the implementation. README §75 makes failure modes part of
the Definition of Done, not an afterthought.

## Observability

To be documented alongside the implementation (README §46).

## Tests

To be documented alongside the implementation. See README §63 for the harness this
package must satisfy.

## Unblocked by

FIN-007, FIN-008
