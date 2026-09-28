# ADR-0036: AI runtime on Nebius Token Factory with tiered NVIDIA Nemotron models

- **Status:** Proposed
- **Date:** 2026-09-28
- **Deciders:** HELL, Nairy
- **Supersedes:** none. Resolves the "AI runtime provider mix" item of README §112 for the hackathon program, and gives ADR-0018 its first concrete provider.

## Context

ADR-0018 requires every model call to cross an AI Gateway, but leaves the provider open. The
hackathon (ADR-0035) requires runtime calls to Nebius Token Factory and at least one NVIDIA open
model. Token Factory exposes an OpenAI-compatible API (`https://api.tokenfactory.nebius.com/v1/`)
with function calling, structured outputs, batch inference (lower cost, asynchronous), dedicated
endpoints and post-training.

Nemotron models listed by the Nebius cookbook as of 2026-09:

- `nvidia/Nemotron-3_5-Lightning` (30B total / 3B active, 1M context);
- `nvidia/nemotron-3-super-120b-a12b` (120B / 12B active);
- `nvidia/Nemotron-3-Ultra-550b-a55b` (550B / 55B active).

These IDs must be confirmed against `GET /v1/models` with the team's key (task S0-05), and the
table below amended if they differ.

## Decision

The AI Gateway (`packages/ai-core`) implements a single provider adapter for Nebius Token Factory,
using its OpenAI-compatible API. Callers never name a model; they request a **tier**. The gateway
maps each tier to a model ID from configuration:

| Tier     | Default model                                                          | Purpose                                            |
| -------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| `FAST`   | Nemotron 3.5 Lightning                                                 | routing, classification, extraction, short replies |
| `AGENT`  | Nemotron 3 Super                                                       | tool-calling agent, narrative                      |
| `DEEP`   | Nemotron 3 Ultra                                                       | second-opinion audit, eval judge                   |
| `VISION` | NVIDIA multimodal model available in Token Factory (to confirm)        | document extraction                                |
| `EMBED`  | embedding model available in Token Factory (to confirm; prefer NVIDIA) | memory                                             |
| `GUARD`  | safety model available in Token Factory (to confirm; prefer NVIDIA)    | input/output safety                                |

The gateway enforces:

- PII redaction before egress;
- a versioned prompt registry;
- schema validation of every response;
- the proof-carrying answer verifier (no model-authored numbers);
- per-call audit (`ai_calls`);
- daily and per-session budgets with a kill switch;
- tier fallback: DEEP→AGENT→FAST→deterministic template.

All model output is `GENERATED_NARRATIVE`.

## Alternatives considered

- **Direct SDK calls from the API.** Rejected: violates ADR-0018 and README §30.
- **A single large model for everything.** Rejected: higher cost and latency. The tiered design
  is also measured and presented as evidence (eval E6).
- **Self-hosted inference on Nebius AI Cloud as the primary path.** Deferred to optional C-1
  (private extraction endpoint): higher operational load and credit usage.
- **An agent framework** (LangChain, CrewAI, NeMo Agent Toolkit). Not adopted for the core loop.
  The loop is small, and owning it keeps the receipts and verifier invariants explicit and
  testable in TypeScript. This can be revisited post-hackathon.

## Consequences

### Positive

- Swapping models is a configuration change.
- Batch inference cuts eval cost.
- The provider is replaceable behind the adapter (ADR-0022 spirit).

### Negative

- Depends on Token Factory availability and on credits during judging.

### Neutral / accepted trade-offs

- Non-NVIDIA models may be used for embeddings or guard only if no NVIDIA equivalent is available.
  The track requirement is satisfied by the Nemotron tiers.

## Security impact

A new outbound trust boundary to Token Factory. Prompts carry redacted content only. Tool
calls are allowlisted per intent. Retrieved web and document content is passed as delimited data,
never as instructions.

## Privacy impact

Financial amounts and redacted context reach the provider. Nebius's retention and training policy
for Token Factory must be confirmed (office hours, task S0-10) and documented in the README before
the privacy claims in the submission are made.

## Cost

Pay per token. Budgets and fallbacks keep spend inside credits. Prices are not recorded here
because they change; the gateway logs estimated cost per call.

## Migration

Not applicable (first implementation).

## Rollback

Point the tier configuration at another OpenAI-compatible provider. No domain code changes.

## References

- ADR-0018, ADR-0022, README §30–§32, §48
- https://github.com/nebius/token-factory-cookbook (models/nemotron)
- `docs/hackathon/04-ai-design-safety-evals.md`
