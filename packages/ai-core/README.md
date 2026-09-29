# @finch/ai-core

AI Gateway: policy, PII classification, prompt registry, schema validation, cost limits. README §30, §31.

> **Status:** walking-skeleton version (task S0-07). The gateway, the Token Factory
> adapter, tier routing, PII redaction, the kill switch and the audit record exist and
> are tested. The prompt registry, receipt verifier (ProofCarryingAnswer), budgets,
> guard model and fallback chain arrive with task S1-04/S1-05.

## Responsibility

The single path from FINCH to a language model. Callers ask for a **tier**
(`FAST` · `AGENT` · `DEEP`), never for a model.

## Owns

- The structured request/response boundary every AI call crosses (`AiGateway.narrate`).
- Tier → model routing from configuration; a tier without a model is unavailable,
  never silently rerouted.
- Redaction before egress (`redactPii`) and restoration for the same user (`restorePii`).
- The `InferencePort` and the OpenAI-compatible adapter for Nebius Token Factory
  (plain `fetch`, no vendor SDK).
- Audit metadata for every AI interaction (`AiCallRecord`), with no prompt or answer text.

## Does not own

- Any authority over financial truth. Balances, interest, eligibility, payment state
  and reconciliation are never LLM outputs (Constitution §4.2, §13).
- Prompts for a specific feature: the calling use case owns its prompt ID and text
  until the prompt registry lands (S1-04).
- Rate limiting per client: that is the API's job (`apps/api/src/platform`).

## Invariants

- Output is always tagged `GENERATED_NARRATIVE` and can never be promoted (§3.3).
- The kill switch `FEATURE_AI_EXPLANATIONS_ENABLED=false` blocks every call before egress (§62).
- Emails and 10+ digit numbers (cards, phones, accounts) never leave FINCH unredacted.
- Provider error bodies are never propagated: they can echo prompt content (§119).
- The API key never appears in errors, health output or audit records.

## Known limits (stated, not hidden)

- National ID numbers shorter than 10 digits and personal names are not detected yet;
  context-aware redaction is part of S1-04.
- No token or cost budget yet; the API's per-client AI turn limit and
  `AI_MAX_OUTPUT_TOKENS` bound spending until S1-04.

## Failure modes

| Failure                             | Error code                           | Behaviour                          |
| ----------------------------------- | ------------------------------------ | ---------------------------------- |
| Kill switch off                     | `FINCH_PROVIDER_AI_DISABLED`         | No provider call; audit `BLOCKED`. |
| No API key or no model for the tier | `FINCH_PROVIDER_AI_UNAVAILABLE`      | No provider call; audit `BLOCKED`. |
| Timeout (`AI_REQUEST_TIMEOUT_MS`)   | `FINCH_PROVIDER_AI_TIMEOUT`          | Audit `FAILED`.                    |
| HTTP 429                            | `FINCH_PROVIDER_AI_RATE_LIMITED`     | Audit `FAILED`.                    |
| HTTP 401/403/5xx, network error     | `FINCH_PROVIDER_AI_UNAVAILABLE`      | Audit `FAILED`.                    |
| Malformed or empty completion       | `FINCH_PROVIDER_AI_INVALID_RESPONSE` | Audit `FAILED`.                    |

## Observability

Every call produces one `AiCallRecord` (correlation ID, tier, model, outcome, tokens,
latency, redaction count) through the injected `AiAuditSink`. Persisting it to the
`ai_calls` table comes with the database schema (S0-14).

## Tests

`pnpm --filter @finch/ai-core test` — redaction boundaries, gateway policy (kill switch,
routing, redaction, audit without content, error mapping) and the adapter against a
real local HTTP server (status mapping, schema validation, timeout, unreachable host).
