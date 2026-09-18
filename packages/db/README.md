# @finch/db

Drizzle schema, migrations and seeds. The only package permitted to touch the database driver. README §24.

## Responsibility

Drizzle schema, migrations and seeds. The only package permitted to touch the database driver. README §24.

## Owns

- Table definitions across the identity, security, finance, planning, decision, documents, actions, integration and audit schemas. Foundation ships `identity` (principals, parties, workspaces, memberships) and `integration` (the outbox); the rest arrive with the domain concepts that need them.
- Versioned migrations following expand -> migrate/backfill -> contract (§72), generated with `drizzle-kit generate` into `migrations/`.
- Synthetic Colombian seed personas (§80), via `seedSyntheticPersonas` built on `@finch/testing`'s deterministic factories.
- The transactional outbox table (§21.1).

## Does not own

- Business rules — those live in @finch/domain.
- Financial mathematics — that is @finch/financial-engine.
- Cross-context queries; a module reads its own tables, and anything else goes through a documented read model (§20).
- Publishing outbox rows to SQS/EventBridge — that is `@finch/worker`'s job; this package only writes and stores them.

## Invariants

- Every tenant-owned table has a non-null workspace_id (§8.6) — enforced by the `memberships` foreign key to `workspaces`, not just by convention.
- Migrations are expand-only in a single step; destructive changes are split across releases (§72).
- An outbox row is written in the SAME transaction as the state change it describes (§21.1) — this package provides the table and the `Database` handle; callers are responsible for the transaction boundary.
- Seeds contain synthetic data only. Production data never reaches a developer machine (Constitution §4.18).
- `outbox.event_id` is unique — the README §21.2 deduplication key is a real database constraint, not just documentation.

## Failure modes

`createDbClient` never validates connectivity itself — a bad `DATABASE_URL` surfaces as
a rejected promise on first query, not at construction. `runMigrations` propagates any
migration failure rather than partially applying and swallowing it.

## Observability

None yet. Query-level tracing arrives when `@finch/observability` is wired into a
composition root that uses this package (apps/api, apps/worker).

## Tests

`src/migrate.test.ts` — integration test using `@finch/testing`'s Postgres
Testcontainers harness: runs a real migration, proves the workspace_id foreign key is
enforced, proves the outbox's `event_id` uniqueness constraint, and proves
`seedSyntheticPersonas` seeds every archetype from README §80 exactly once.

## Unblocked by

FIN-007, FIN-008
