# @finch/db

Drizzle schema, migrations and seeds. The only package permitted to touch the database
driver. README §24, §72, §80.

> **Status:** schema v1 (task S0-14). 23 tables in seven schemas, two migrations, the
> synthetic personas and integration tests against PostgreSQL 18.6.

**Stack (npm registry, 2026-09-29):** drizzle-orm 0.45.3 · drizzle-kit 0.31.11 ·
postgres.js 3.4.9 · @testcontainers/postgresql 12.1.0 (12.2.0 is newer than pnpm's
minimum release age, ADR-0042).

## Schemas

| Schema        | Tables                                                                                                       |
| ------------- | ------------------------------------------------------------------------------------------------------------ |
| `identity`    | `principals`, `parties`, `workspaces`, `workspace_parties`, `memberships`, `grants`                          |
| `finance`     | `accounts`, `balance_observations`, `transactions`, `credit_cards`, `loans`, `income_streams`, `obligations` |
| `planning`    | `goals`, `envelopes`, `financial_snapshots`                                                                  |
| `decision`    | `calc_receipts`, `decision_cards`, `memories`                                                                |
| `documents`   | `documents` (metadata only; bytes live in encrypted object storage)                                          |
| `audit`       | `audit_events`, `ai_calls`                                                                                   |
| `integration` | `outbox_events`                                                                                              |

## Owns

- Table definitions, versioned SQL migrations (`migrations/`) and their review.
- The database client (`connect`), the migrator (`runMigrations`) and the operator CLI.
- Synthetic seed personas: Laura (Medellín, cards and a loan), Andrés (Bogotá, variable
  COP + USD income) and the Pérez household (two members, one shared account, one
  private card). Sofía (second country) waits for decision D-11.

## Does not own

- Business rules (@finch/domain) and financial mathematics (@finch/financial-engine).
- Cross-context queries: a module reads its own tables; anything else goes through a
  documented read model (§20).

## Invariants (enforced by the database, not only by code)

- Every tenant-owned table has a non-null `workspace_id` with a foreign key; deleting a
  workspace that still owns data is refused.
- Money is `bigint` minor units + an ISO currency checked by `^[A-Z]{3}$`; rates are
  `numeric(12,6)` with a quoting convention (`EA`, `MV`, `NAMV`). bigint values come
  back as JS `bigint`, never `number`.
- Every financial row carries provenance: truth class, source type, source reference.
- `accounts.masked_number` holds four digits at most; full numbers cannot be stored.
- Import lines are unique per workspace (`transactions_workspace_dedupe`).
- A calculation receipt is `DERIVED_DETERMINISTIC` or `ESTIMATED`, never model narrative.
- `financial_snapshots` and `calc_receipts` are immutable; `audit_events` and `ai_calls`
  are append-only. Triggers reject `UPDATE`, `DELETE` and `TRUNCATE`
  (`0001_append_only_guards.sql`). Retention purges (§51) will get their own audited
  function.
- Documents: MIME allowlist, 10 MiB cap, SHA-256, `DELETED` ⇔ `deleted_at`.
- Migrations are expand-only; destructive changes are split across releases (§72).
- Seeds contain synthetic data only (Constitution §4.18) and are idempotent.

## Commands

```bash
pnpm dev:infra                                 # PostgreSQL 18.6 in Docker
pnpm db:migrate                                # apply migrations (reads DATABASE_URL)
pnpm db:seed                                   # migrations + personas (idempotent)
pnpm --filter @finch/db db:generate            # generate SQL from the schema, then review it
pnpm --filter @finch/db test                   # persona integrity (no database)
pnpm --filter @finch/db test:integration       # PostgreSQL 18.6 via Testcontainers (Docker)
```

## Failure modes

- Missing `DATABASE_URL` or unknown command: the CLI exits with code 2 and never prints
  the URL.
- A constraint or trigger violation raises a PostgreSQL error naming the constraint.
- A failed migration leaves earlier migrations applied; each migration runs in its own
  transaction and can be re-run.

## Rollback

v1 creates new schemas only. To roll back a fresh environment: drop the seven schemas and
the `drizzle` migrations schema. Never roll back a database that holds user data this
way; ship a forward migration instead.

## Tests

7 unit tests (persona integrity, planted demo cases, no PII) and 11 integration tests
(schemas on PostgreSQL 18, idempotent migrations and seed, bigint round trip, currency,
masked number, dedupe, receipt truth class, foreign keys, append-only triggers
including `TRUNCATE`). CI runs them in the `Integration · PostgreSQL` job.
