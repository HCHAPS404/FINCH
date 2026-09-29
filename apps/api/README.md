# apps/api

Core HTTP API. NestJS + Fastify, REST under /api/v1, OpenAPI emitted in CI.

> **Status:** walking skeleton (task S0-07). Health, one assistant turn through the AI
> Gateway, correlation IDs, the stable error shape and per-client limits exist and are
> tested end to end. Authentication, authorization, OpenAPI generation and the database
> arrive with the tasks listed under _Next_.

**Stack (verified in the npm registry on 2026-09-29):** NestJS 12.1.0 (native ESM; 12.1.1 is newer than pnpm's minimum release age) ·
Fastify 5.12.5 · Zod 4.6.5 at the boundary.

## Endpoints

| Method | Path                      | Purpose                                                 | Notes                                                                                                                                                                        |
| ------ | ------------------------- | ------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/health`             | Liveness, build, environment, AI tiers and their models | Never calls the provider; never reports secrets.                                                                                                                             |
| POST   | `/api/v1/assistant/turns` | One question → one explanation (FAST tier)              | Body `{ "message": string }` (1–4,000 chars). Answer tagged `GENERATED_NARRATIVE`; prompt `assistant.skeleton@1` forbids stating figures until the receipt verifier (S1-05). |

## Owns

- HTTP transport, routing and the stable error taxonomy (§58, §119).
- Request authentication and the call into @finch/authorization (not yet — see _Next_).
- Boundary validation (zod) and the OpenAPI document (§102.5).
- Idempotency-Key handling for sensitive commands (§58).
- Per-client abuse limits (`API_RATE_LIMIT_PER_MINUTE`, `AI_TURNS_PER_MINUTE`).
- Composition root (`src/app.ts`): the only place adapters are wired to ports.

## Does not own

- Business rules — controllers contain no business logic (§57).
- Financial mathematics — that is @finch/financial-engine.
- Model access policy — that is @finch/ai-core.
- Authorization decisions — it asks @finch/authorization, it does not decide.

## Invariants

- Authorization is evaluated server-side on every request. The client is never trusted (§12).
- Cursor pagination for high-volume collections; never offset (§119).
- Raw provider errors are never surfaced to users (§119).
- Every response carries `x-correlation-id`; a caller's ID is kept only if it is a safe
  8–64 character token (§121).
- Every response is `cache-control: no-store` and `x-content-type-options: nosniff`.
- JSON bodies are capped at 16 KiB.

## Failure modes

| Situation                        | Status              | Code                                                         |
| -------------------------------- | ------------------- | ------------------------------------------------------------ |
| Invalid body                     | 400                 | `FINCH_VALIDATION_ERROR` (with `details`)                    |
| Unknown route                    | 404                 | `FINCH_VALIDATION_NOT_FOUND`                                 |
| Too many requests / AI turns     | 429 + `retry-after` | `FINCH_RATE_LIMIT_REQUESTS` / `FINCH_RATE_LIMIT_AI_TURNS`    |
| AI kill switch, provider failure | 502                 | `FINCH_PROVIDER_AI_*` (see @finch/ai-core)                   |
| Anything unexpected              | 500                 | `FINCH_INTERNAL_ERROR` — logged once with the correlation ID |

The rate limiter is in-process: correct for one instance. Scaling out needs a shared
store and an ADR (README §90).

## Observability

Fastify request logs (authorization header redacted) and one error log per unexpected
failure, both carrying the correlation ID. AI calls are audited by @finch/ai-core.
OpenTelemetry arrives with FIN-023.

## Running

```bash
pnpm --filter @finch/api dev    # builds, reads ../../.env, listens on API_PORT
curl -s localhost:4000/api/health
```

## Tests

`pnpm --filter @finch/api test` — the real app, gateway and adapter over HTTP against a
local server standing in for Token Factory: health, correlation IDs, security headers,
assistant turn with redaction and audit, validation, kill switch, provider failure,
both rate limits and unknown routes.

## Next

S1-04 (full AI Gateway), FIN-021 (auth port), FIN-020 (authorization), FIN-010
(OpenAPI/codegen), S0-14 (database), deploy after S0-06 (topology decision).
