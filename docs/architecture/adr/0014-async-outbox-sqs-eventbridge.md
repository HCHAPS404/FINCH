# ADR-0014: Transactional outbox published to SQS and EventBridge

- **Status:** Accepted
- **Date:** 2026-09-17
- **Deciders:** HELL
- **Normative source:** README.md §21, §113

## Context

> **Outstanding.** The decision below is recorded from README.md, which README §2 establishes as the architecture authority. This file exists so the decision is discoverable and supersedable in the normal way. The forces and measurements that justify it have not yet been written out here.

## Decision

Domain state changes and their outbox rows are written in one transaction; an asynchronous publisher forwards them. Delivery is at-least-once, so every consumer is idempotent and every failure path ends in a DLQ.

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

- README.md §21, §113
- `docs/architecture/adr/0000-template.md`
