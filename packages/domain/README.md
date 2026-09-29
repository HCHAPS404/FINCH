# @finch/domain

Entities, value objects and invariants. README §8, §10, §60.

> **Status:** Foundation ships the `Clock` port only. Principal, Party, Workspace and
> Membership arrive with FIN-017..FIN-020 and the S0-14 schema.

## Owns

- `Clock` (`systemClock` for the composition root, `fixedClock` for tests and for
  replaying a historical decision).

## Does not own

- Frameworks, SDKs, the database or adapters (`domain-is-framework-free`,
  `domain-does-not-import-adapters`).

## Invariants

- The domain never reads ambient time (`Date.now` is banned in pure layers): a
  historical decision must be reproducible (Constitution §4.5).
- Depends only on @finch/contracts and @finch/financial-engine.

## Tests

Arrive with the first entities.
