# ADR-0018: All AI runtime access passes through an AI Gateway

- **Status:** Proposed
- **Date:** 2026-09-17
- **Deciders:** HELL
- **Normative source:** README.md §30, §31, §32

## Context

> **Outstanding.** This decision is deliberately still open — see README §112. This file records the question and the constraints so the eventual decision has somewhere to land.

## Decision

PROPOSED. Every LLM call crosses a gateway that applies data classification, redaction, provider routing, a versioned prompt registry, schema validation, timeout and cost limits, and audit metadata. An LLM is never authoritative over financial truth. The runtime provider mix remains open (§112).

## Alternatives considered

> **Outstanding.** To be written before this ADR is treated as a complete decision
> record. Listing the alternatives that were genuinely weighed — and the concrete
> reason each was set aside — is the part of an ADR that has value years later.

## Consequences

> **Outstanding.** Positive, negative and accepted trade-offs to be recorded.

## Security impact

> **Outstanding.**

## Privacy impact

> **Outstanding.**

## Cost

> **Outstanding.**

## Migration

> **Outstanding.**

## Rollback

> **Outstanding.**

## References

- README.md §30, §31, §32
- `docs/architecture/adr/0000-template.md`
