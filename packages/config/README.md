# @finch/config

Typed configuration, validated once at startup. README §61.

## Responsibility

Turn an environment record into a validated `FinchConfig`, or stop the process with the
names of the wrong keys — never their values.

## Owns

- Sections kept apart by sensitivity: `public`, `jurisdiction`, `flags` (kill switches,
  §62), `ai` (Token Factory endpoint, model per tier, timeout, output cap), `limits`
  (per-client request and AI-turn limits) and `secrets` (database URL, Sentry DSN, JWKS
  URL, Nebius API key).
- `redactedConfig` — a view safe to log.

## Does not own

- Reading `process.env`: callers pass the environment in, so the function stays pure.
- Secret storage: secrets live in the local `.env` or the host secret store (§40).

## Invariants

- Empty variables are treated as absent.
- Every kill switch defaults to off.
- No model ID is assumed: each must be confirmed with `GET /v1/models` (task S0-05).
- Validation errors and redacted views never contain secret values.

## Tests

`pnpm --filter @finch/config test`. Keys are documented in `.env.example`.
