# @finch/authorization

Relational authorization: can(principal, action, resource, workspace, context). README §9.

> **Status:** boundary only. No implementation yet — see _Unblocked by_ below.
> This file is the module contract required by README §98. It is written before the
> code so the package cannot quietly acquire responsibilities it was never meant to
> have.

## Responsibility

Relational authorization: can(principal, action, resource, workspace, context). README §9.

## Owns

- The `authorize()` contract and its decision type.
- Policy evaluation over Membership and Grant.
- The negative-path test harness required by README §9.

## Does not own

- Authentication — that belongs to the identity provider port.
- Storage of memberships and grants — that is @finch/db.
- UI-side permission hints; the client never decides authorization (§12).

## Invariants

- Deny by default. An unrecognised action is denied, never allowed.
- Every decision carries a reason, so a denial is debuggable.
- A decision never depends on ambient state; everything arrives in the request.
- Support principals receive masked access only, never raw financial values.

## Failure modes

To be documented alongside the implementation. README §75 makes failure modes part of
the Definition of Done, not an afterthought.

## Observability

To be documented alongside the implementation (README §46).

## Tests

To be documented alongside the implementation. See README §63 for the harness this
package must satisfy.

## Unblocked by

FIN-020
