# @finch/ui-web

React component library for apps/web and apps/desktop. README §34.

> **Status:** boundary only. No implementation yet — see _Unblocked by_ below.
> This file is the module contract required by README §98. It is written before the
> code so the package cannot quietly acquire responsibilities it was never meant to
> have.

## Responsibility

React component library for apps/web and apps/desktop. README §34.

## Owns

- Shared web components built on @finch/design-tokens.

## Does not own

- Business logic — components render, they do not decide (§57).
- Data fetching policy; that is the application's concern.

## Invariants

- Every financial chart has an equivalent accessible textual representation (§35).
- Stale and estimated values are visually distinguishable from verified ones (§116).

## Failure modes

To be documented alongside the implementation. README §75 makes failure modes part of
the Definition of Done, not an afterthought.

## Observability

To be documented alongside the implementation (README §46).

## Tests

To be documented alongside the implementation. See README §63 for the harness this
package must satisfy.

## Unblocked by

FIN-012
