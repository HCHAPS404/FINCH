# @finch/design-tokens

Semantic design tokens shared by web, mobile and desktop. README §34.

> **Status:** boundary only. No implementation yet — see _Unblocked by_ below.
> This file is the module contract required by README §98. It is written before the
> code so the package cannot quietly acquire responsibilities it was never meant to
> have.

## Responsibility

Semantic design tokens shared by web, mobile and desktop. README §34.

## Owns

- Semantic tokens: surface, text, border, positive, negative, warning, critical, verified, estimated, stale, pending.
- Light and dark palettes as first-class peers.

## Does not own

- Component implementations — those are @finch/ui-web and @finch/ui-mobile.

## Invariants

- Financial state is never conveyed by colour alone; verified/estimated/stale need a non-colour signal too (§34, §35).
- Every token pair meets contrast requirements in both themes (§35).

## Failure modes

To be documented alongside the implementation. README §75 makes failure modes part of
the Definition of Done, not an afterthought.

## Observability

To be documented alongside the implementation (README §46).

## Tests

To be documented alongside the implementation. See README §63 for the harness this
package must satisfy.

## Unblocked by

FIN-015
