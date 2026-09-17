# @finch/security

Cryptographic helpers, redaction, webhook verification, security headers. README §38.

> **Status:** boundary only. No implementation yet — see _Unblocked by_ below.
> This file is the module contract required by README §98. It is written before the
> code so the package cannot quietly acquire responsibilities it was never meant to
> have.

## Responsibility

Cryptographic helpers, redaction, webhook verification, security headers. README §38.

## Owns

- Redaction utilities shared by logging and error reporting.
- Webhook signature verification and replay-window checks.
- Hashing and constant-time comparison helpers.

## Does not own

- Authorization decisions — that is @finch/authorization.
- Secret storage — secrets live in AWS Secrets Manager, never in code (§40).

## Invariants

- No secret material is ever written to disk or logs.
- Comparisons on secret-derived values are constant-time.
- Nothing here weakens under test configuration (§42).

## Failure modes

To be documented alongside the implementation. README §75 makes failure modes part of
the Definition of Done, not an afterthought.

## Observability

To be documented alongside the implementation (README §46).

## Tests

To be documented alongside the implementation. See README §63 for the harness this
package must satisfy.

## Unblocked by

FIN-027 onward
