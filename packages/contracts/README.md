# @finch/contracts

The shared vocabulary of FINCH: truth classes, provenance, the error taxonomy, the event
envelope, tenancy identifiers and risk tiers. README §3.3, §11, §21, §58, §18.

## Responsibility

Types and pure constants every other package agrees on.

## Owns

- `TruthClass` (`OBSERVED`, `USER_ASSERTED`, `DERIVED_DETERMINISTIC`, `ESTIMATED`,
  `GENERATED_NARRATIVE`), `canDriveIrreversibleAction`, `isAuthoritative`, `Provenance`,
  `SourceType`, `Freshness`.
- The error taxonomy: `FinchErrorCode` (`FINCH_<NAMESPACE>_<DETAIL>`), `FinchErrorBody`,
  `NAMESPACE_HTTP_STATUS`.
- `EventEnvelope` and `OutboxRecord` (README §21).
- Tenancy: `PrincipalId`, `PartyId`, `WorkspaceId` (branded), `TenantOwned`,
  `AuthorizationRequest`, `AuthorizationDecision`.
- Risk tiers `R0`–`R4`, capability classes and data classifications.

## Does not own

- Behaviour beyond pure predicates. No validation library, no I/O.

## Invariants

- **Leaf package:** no dependencies at all, workspace or npm (`contracts-are-leaf` in
  .dependency-cruiser.cjs).
- An error code that ships is kept: mobile clients outlive backend versions (§59).
- Model output is `GENERATED_NARRATIVE` and is never authoritative.

## Tests

`pnpm --filter @finch/contracts test`.
