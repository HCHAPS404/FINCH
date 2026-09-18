# @finch/authorization

Relational authorization: can(principal, action, resource, workspace, context). README §9.

## Responsibility

Relational authorization: can(principal, action, resource, workspace, context). README §9.

## Owns

- The `authorize()` contract and its decision type.
- Policy evaluation over Membership. Per-resource Grant (§8.5) evaluation arrives when
  a resource actually needs it — Foundation only has workspace-wide Membership
  capabilities to evaluate.
- The negative-path test harness required by README §9.

## Does not own

- Authentication — that belongs to the identity provider port (`AuthSessionPort` in
  `@finch/domain`).
- Storage of memberships and grants — that is @finch/db. This package never imports a
  database driver; the caller looks up the relevant Membership and passes it in.
- UI-side permission hints; the client never decides authorization (§12).
- Response redaction for masked/support access — `AuthorizationDecision` only ever
  answers allowed/denied with a reason; shaping what a "masked" response looks like is
  whichever package renders it.

## Invariants

- Deny by default. An unrecognised action is denied, never allowed.
- Every decision carries a reason, so a denial is debuggable.
- A decision never depends on ambient state; everything arrives in the request —
  `authorize()` takes the caller's Membership as an explicit input, never fetches it.
- No principal type receives an implicit bypass. ADMIN and SERVICE principals are
  authorized by their Membership's capabilities exactly like a HUMAN principal is
  (README §9's "admin scoped" / "service principal least privilege").

## Failure modes

`authorize()` cannot fail — every input it can be given produces a decision (allow or
a specifically-coded deny). There is no exception path to document.

## Observability

None. Authorization decisions are logged by the caller (the composition root), which
has the correlation id this package does not.

## Tests

`src/authorize.test.ts` covers the full README §9 harness: owner allowed, other
workspace denied (both "no membership" and "membership for a different workspace"),
membership without grant denied, revoked member denied, admin scoped, service
principal least privilege, and that every denial carries a debuggable reason.
"Support masked-only" is out of scope here — see Does not own.

## Unblocked by

FIN-020
