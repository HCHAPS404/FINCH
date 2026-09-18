# @finch/testing

Shared test factories, synthetic personas and the Testcontainers harness. README §73, §80.

## Responsibility

Deterministic test data and the PostgreSQL Testcontainers harness that `@finch/db`'s
migration and query tests run against a real, ephemeral database.

## Owns

- Synthetic Colombian personas (§80): `salaried_simple`, `salaried_multi_debt`,
  `freelancer_variable`, `household_shared`, `credit_card_heavy`,
  `saver_goal_oriented`, `microbusiness_owner`, plus `createPersonaIdentity`, which
  builds a full Principal/Party/Workspace/Membership chain for one.
- The PostgreSQL Testcontainers harness (`startPostgresHarness`) — pinned to the same
  image tag as `infra/docker/compose.yaml` (README §24).
- Deterministic factories and seeded randomness (`createSeededRandom`, `randomId`) —
  the reproducible equivalent of `Math.random()`, which is banned in the pure layers.

## Does not own

- Assertions about business behaviour; those belong to the package under test.
- Production fixtures. All test data is synthetic (Constitution §4.18).
- Migrations and schema themselves — those are `@finch/db`'s.

## Invariants

- Every factory is deterministic given a seed, so a failure is reproducible.
- No persona contains real PII.
- This is the one package outside `@finch/db` allowed to import `pg` directly
  (`.dependency-cruiser.cjs`'s `no-direct-db-outside-adapters` exemption) — exactly so
  the harness itself can prove a container is connectable, without becoming a general
  license to query the database from test code.

## Failure modes

`startPostgresHarness` rejects if Docker is unavailable or the image cannot be pulled;
callers are expected to let that failure fail the test run rather than catching it.

## Observability

None — this package runs inside test processes, which have their own reporter output.

## Tests

`src/random.test.ts` (determinism), `src/personas.test.ts` (archetype shape,
Workspace-type mapping), `src/postgres-harness.test.ts` (integration: starts a real
container, connects with `pg`, runs `SELECT 1`, tears it down).

## Unblocked by

FIN-007
