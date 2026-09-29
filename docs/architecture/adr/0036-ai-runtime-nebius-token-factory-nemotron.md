# ADR-0036: AI runtime on Nebius Token Factory with tiered NVIDIA Nemotron models

- **Status:** Proposed
- **Date:** 2026-09-28
- **Deciders:** HELL, Irene
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

These IDs were confirmed against `GET /v1/models` with the team's key on 2026-09-29 (task
S0-05); see **Verification** below.

## Decision

The AI Gateway (`packages/ai-core`) implements a single provider adapter for Nebius Token Factory,
using its OpenAI-compatible API. Callers never name a model; they request a **tier**. The gateway
maps each tier to a model ID from configuration:

| Tier     | Default model                                                          | Purpose                                            |
| -------- | ---------------------------------------------------------------------- | -------------------------------------------------- |
| `FAST`   | `nvidia/Nemotron-3_5-Lightning`                                        | routing, classification, extraction, short replies |
| `AGENT`  | `nvidia/nemotron-3-super-120b-a12b`                                    | tool-calling agent, narrative                      |
| `DEEP`   | `nvidia/Nemotron-3-Ultra-550b-a55b`                                    | second-opinion audit, eval judge                   |
| `VISION` | `openbmb/MiniCPM-V-4_5` — **proposed**, no NVIDIA multimodal is served | document extraction                                |
| `EMBED`  | `Qwen/Qwen3-Embedding-8B` — the only embedding model served            | memory                                             |
| `GUARD`  | none served — **open**, see Verification                               | input/output safety                                |

The gateway enforces:

- PII redaction before egress;
- a versioned prompt registry;
- schema validation of every response;
- the proof-carrying answer verifier (no model-authored numbers);
- per-call audit (`ai_calls`);
- daily and per-session budgets with a kill switch;
- tier fallback: DEEP→AGENT→FAST→deterministic template.

All model output is `GENERATED_NARRATIVE`.

## Verification (S0-05, 2026-09-29)

`pnpm ai:models` listed 25 models on `api.tokenfactory.nebius.com`. Each tier model then
answered one real completion (HTTP 200); the embedding model returned 4096-dimension vectors.
The API's `/api/health` reported FAST, AGENT and DEEP available, and one assistant turn
through the AI Gateway answered in 2.8 s on FAST.

| Tier     | Model ID                            | Modality          | Context   | Region         | Features                      |
| -------- | ----------------------------------- | ----------------- | --------- | -------------- | ----------------------------- |
| `FAST`   | `nvidia/Nemotron-3_5-Lightning`     | text → text       | 1,048,576 | eu-north1 (FI) | tools, reasoning              |
| `AGENT`  | `nvidia/nemotron-3-super-120b-a12b` | text → text       | 262,144   | us-central1    | tools, reasoning              |
| `DEEP`   | `nvidia/Nemotron-3-Ultra-550b-a55b` | text → text       | 1,048,576 | us-central1    | tools, reasoning              |
| `VISION` | `openbmb/MiniCPM-V-4_5`             | text+image → text | 32,000    | eu-north1 (FI) | json_mode, structured_outputs |
| `EMBED`  | `Qwen/Qwen3-Embedding-8B`           | text → embedding  | 40,960    | eu-north1 (FI) | —                             |

Findings that need the founders' decision:

- **VISION.** No NVIDIA multimodal model is served (the only other NVIDIA model,
  `nvidia/NVIDIA-Nemotron-3-Nano-30B-A3B`, is text-only). `openbmb/MiniCPM-V-4_5` is the only
  image-capable model and supports structured outputs. The trade-off below allows non-NVIDIA
  models only for embeddings and guard, so using it for VISION amends this ADR.
- **GUARD.** No dedicated safety model is served. Options: a guard prompt on the FAST tier with
  structured output plus the deterministic checks the gateway already runs, or a guard hosted
  elsewhere (a new trust boundary, so a new ADR).
- **Data residency.** FAST, VISION and EMBED run in Finland; AGENT and DEEP in the US. The
  privacy notes in the submission must name both regions.

Prices are per token in the catalog and change; they are not recorded here (see **Cost**).

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
