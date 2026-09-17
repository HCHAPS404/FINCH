# @finch/testing

Shared test factories, synthetic personas and the Testcontainers harness. README §73, §80.

> **Status:** boundary only. No implementation yet — see _Unblocked by_ below.
> This file is the module contract required by README §98. It is written before the
> code so the package cannot quietly acquire responsibilities it was never meant to
> have.

## Responsibility

Shared test factories, synthetic personas and the Testcontainers harness. README §73, §80.

## Owns

- Synthetic Colombian personas (§80): salaried_simple, freelancer_variable, household_shared and the rest.
- The PostgreSQL Testcontainers harness.
- Deterministic factories and seeded randomness.

## Does not own

- Assertions about business behaviour; those belong to the package under test.
- Production fixtures. All test data is synthetic (Constitution §4.18).

## Invariants

- Every factory is deterministic given a seed, so a failure is reproducible.
- No persona contains real PII.

## Failure modes

To be documented alongside the implementation. README §75 makes failure modes part of
the Definition of Done, not an afterthought.

## Observability

To be documented alongside the implementation (README §46).

## Tests

To be documented alongside the implementation. See README §63 for the harness this
package must satisfy.

## Unblocked by

FIN-007
