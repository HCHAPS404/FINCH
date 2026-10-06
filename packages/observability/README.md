# @finch/observability

OpenTelemetry bootstrap, structured logging with redaction, correlation. README §46.

## Responsibility

OpenTelemetry traces/metrics bootstrap, the structured logger and its mandatory
redaction rules, and correlation-id propagation across an operation (README §46,
§3.8, ADR-0024).

## Owns

- OTel traces and metrics initialisation via `bootstrapObservability` (§3.8: logs go
  through the structured logger, not OTel Logs — that API is still under active
  development upstream).
- The structured logger (`createLogger`, built on pino) and its redaction rules.
- Correlation propagation (`runWithCorrelation`/`getCorrelationContext`,
  `AsyncLocalStorage`-based) so `correlationId`/`causationId` reach a log line or an
  event envelope without being threaded through every function signature.

## Does not own

- Product analytics — a different concern with different sensitivity (§54).
- Audit events — those are a domain concern with their own retention (§54).
- Sentry — a separate integration (FIN-024), composed at the app level alongside this
  package rather than inside it.
- _Which_ exporter target to use in production — that is `FINCH_ENV`/`OTEL_*`
  configuration owned by `@finch/config`, read by whatever composition root calls
  `bootstrapObservability`.

## Invariants

- Tokens, full account numbers, complete documents and raw provider payloads are never
  logged (§12) — enforced by `createLogger`'s redaction paths, not by caller discipline.
- Telemetry failure never fails a request: `bootstrapObservability` and its returned
  `shutdown()` both catch and log rather than throw.
- Every log line carries a correlation id so a user-visible support code can find it
  (§121), once a caller uses `withCorrelation`/`runWithCorrelation`.
- With OTel disabled or no OTLP endpoint configured, telemetry prints to the console
  rather than going nowhere — README §102.17 requires a trace to be visible locally
  without a collector, and the local Docker Compose stays Postgres-only until an ADR
  justifies adding one.

## Failure modes

`bootstrapObservability` never throws: a failure to start the SDK is logged as a
warning and the process continues uninstrumented rather than refusing to boot. The
logger has no failure mode of its own — a destination write failure is pino's problem,
not this package's, and is not swallowed silently.

## Observability

This package IS the observability layer; it has no separate telemetry about itself
beyond the warning logs described above.

## Tests

`src/logger.test.ts` (redaction, level filtering, correlation fields),
`src/correlation.test.ts` (`AsyncLocalStorage` scoping), `src/otel.test.ts`
(`activeTraceId` against the OpenTelemetry API), `src/otel.smoke.test.ts` (the README
§102.17 proof: boots the SDK in console mode and asserts a span is actually printed).

## Unblocked by

FIN-022, FIN-023
