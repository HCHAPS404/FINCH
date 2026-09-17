# @finch/provider-sdk

Provider port definitions, contract fixtures and the capability registry. README §27, §28.

> **Status:** boundary only. No implementation yet — see _Unblocked by_ below.
> This file is the module contract required by README §98. It is written before the
> code so the package cannot quietly acquire responsibilities it was never meant to
> have.

## Responsibility

Provider port definitions, contract fixtures and the capability registry. README §27, §28.

## Owns

- Port interfaces: AccountDataProvider, PaymentProvider, DocumentExtractorProvider, IdentityProvider, NotificationProvider, AIProvider, ProductDataProvider.
- Contract fixtures each adapter must satisfy.
- The normalized provider capability registry (§28).

## Does not own

- Vendor SDK calls — those live in adapters inside apps/*/src/infrastructure.
- Provider selection policy; that is control-plane configuration (§7.5).

## Invariants

- A port is defined by FINCH's needs, never by a vendor's API shape (Constitution §4.9).
- Every adapter declares timeout, bounded retry, rate limits and error mapping (§27).
- Webhook handling verifies signature and replay window before any processing (§119).

## Failure modes

To be documented alongside the implementation. README §75 makes failure modes part of
the Definition of Done, not an afterthought.

## Observability

To be documented alongside the implementation (README §46).

## Tests

To be documented alongside the implementation. See README §63 for the harness this
package must satisfy.

## Unblocked by

Weeks 20-21 of the programme (§84)
