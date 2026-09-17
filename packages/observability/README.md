# @finch/observability

OpenTelemetry bootstrap, structured logging with redaction, correlation. README §46.

> **Status:** boundary only. No implementation yet — see _Unblocked by_ below.
> This file is the module contract required by README §98. It is written before the
> code so the package cannot quietly acquire responsibilities it was never meant to
> have.

## Responsibility

OpenTelemetry bootstrap, structured logging with redaction, correlation. README §46.

## Owns

- OTel traces and metrics initialisation (§3.8: logs go through pino, not OTel Logs).
- The structured logger and its mandatory redaction rules.
- Propagation of trace_id, correlation_id and causation_id across HTTP, outbox, queue and worker.

## Does not own

- Product analytics — a different concern with different sensitivity (§54).
- Audit events — those are a domain concern with their own retention (§54).

## Invariants

- Tokens, full account numbers, complete documents and raw provider payloads are never logged (§12).
- Telemetry failure never fails a request.
- Every log line carries a correlation id so a user-visible support code can find it (§121).

## Failure modes

To be documented alongside the implementation. README §75 makes failure modes part of
the Definition of Done, not an afterthought.

## Observability

To be documented alongside the implementation (README §46).

## Tests

To be documented alongside the implementation. See README §63 for the harness this
package must satisfy.

## Unblocked by

FIN-022, FIN-023, FIN-024
