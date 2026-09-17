# @finch/api-client

Typed HTTP client GENERATED from the API's OpenAPI document. Never hand-written. README §58, §102.6.

> **Status:** boundary only. No implementation yet — see _Unblocked by_ below.
> This file is the module contract required by README §98. It is written before the
> code so the package cannot quietly acquire responsibilities it was never meant to
> have.

## Responsibility

Typed HTTP client GENERATED from the API's OpenAPI document. Never hand-written. README §58, §102.6.

## Owns

- The generated client surface under src/generated/.
- A thin hand-written wrapper for auth, correlation IDs and error mapping.

## Does not own

- The API contract itself — that is emitted by apps/api.
- Retry and caching policy; each client surface decides its own.

## Invariants

- src/generated/ is regenerated, never edited. CI fails on drift (§44).
- The client surfaces the stable error taxonomy, never raw provider errors (§119).

## Failure modes

To be documented alongside the implementation. README §75 makes failure modes part of
the Definition of Done, not an afterthought.

## Observability

To be documented alongside the implementation (README §46).

## Tests

To be documented alongside the implementation. See README §63 for the harness this
package must satisfy.

## Unblocked by

FIN-010
