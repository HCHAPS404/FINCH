# @finch/ai-core

AI Gateway: policy, PII classification, prompt registry, schema validation, cost limits. README §30, §31.

> **Status:** boundary only. No implementation yet — see _Unblocked by_ below.
> This file is the module contract required by README §98. It is written before the
> code so the package cannot quietly acquire responsibilities it was never meant to
> have.

## Responsibility

AI Gateway: policy, PII classification, prompt registry, schema validation, cost limits. README §30, §31.

## Owns

- The structured request/response boundary every AI call crosses.
- Data classification and redaction policy before egress (§31).
- Versioned prompt registry and provider routing.
- Audit metadata for every AI interaction.

## Does not own

- Any authority over financial truth. Balances, interest, eligibility, payment state and reconciliation are never LLM outputs (Constitution §4.2, §13).
- Direct provider SDK usage in the domain; the gateway is the only path.

## Invariants

- Every response is schema-validated before it reaches a caller.
- Document text is treated as untrusted input with respect to prompt injection (§31).
- An AI outage degrades explanations only; calculations and Decision Cards continue (§48).
- Output is always tagged GENERATED_NARRATIVE and can never be promoted to VERIFIED (§3.3).

## Failure modes

To be documented alongside the implementation. README §75 makes failure modes part of
the Definition of Done, not an afterthought.

## Observability

To be documented alongside the implementation (README §46).

## Tests

To be documented alongside the implementation. See README §63 for the harness this
package must satisfy.

## Unblocked by

ADR-0018
