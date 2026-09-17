# apps/api

Core HTTP API. NestJS + Fastify, REST under /api/v1, OpenAPI emitted in CI.

> **Status:** boundary only. No implementation yet — see _Unblocked by_.
>
> This package intentionally declares **no `build` or `test` script**. A script that
> echoes and exits 0 would report green in CI while building nothing, which is exactly
> the silent shortcut README §42 forbids. Turbo skips tasks a package does not declare,
> so the absence is honest and harmless. Scripts arrive with the implementation.

**Planned stack:** NestJS 12.0.3 · Fastify 5.12.5 · Zod 4.6.5 at the boundary

## Owns

- HTTP transport, routing and the stable error taxonomy (§58, §119).
- Request authentication and the call into @finch/authorization.
- Boundary validation and the OpenAPI document (§102.5).
- Idempotency-Key handling for sensitive commands (§58).
- Composition root: this is where adapters are wired to ports.

## Does not own

- Business rules — controllers contain no business logic (§57).
- Financial mathematics — that is @finch/financial-engine.
- Authorization decisions — it asks @finch/authorization, it does not decide.

## Invariants

- Authorization is evaluated server-side on every request. The client is never trusted (§12).
- Cursor pagination for high-volume collections; never offset (§119).
- Raw provider errors are never surfaced to users (§119).
- Every response carries a correlation id (§121).

## Unblocked by

FIN-005, FIN-009, FIN-010
