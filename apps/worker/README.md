# apps/worker

Background runtime. Same monorepo, different entrypoint. Outbox publication, provider sync, document pipelines, recomputations.

> **Status:** boundary only. No implementation yet — see _Unblocked by_.
>
> This package intentionally declares **no `build` or `test` script**. A script that
> echoes and exits 0 would report green in CI while building nothing, which is exactly
> the silent shortcut README §42 forbids. Turbo skips tasks a package does not declare,
> so the absence is honest and harmless. Scripts arrive with the implementation.

**Planned stack:** Node 24 LTS · same packages as apps/api

## Owns

- Publishing transactional outbox rows to SQS/EventBridge (§21.1).
- Idempotent event consumers with bounded retries and a DLQ (§21.3).
- Scheduled recomputations and notification dispatch.

## Does not own

- HTTP surface — that is apps/api.
- Durable multi-day workflows; those need Temporal or Step Functions and an ADR (§22).

## Invariants

- Every consumer is idempotent. Delivery is at-least-once (Constitution §4.12, §4.13).
- No unbounded retry. Every failure path ends in a DLQ (§49).
- Telemetry carries trace_id and causation_id from the originating request (§46).

## Unblocked by

FIN-006
