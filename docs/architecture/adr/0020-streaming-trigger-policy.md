# ADR-0020: No Kafka/MSK until stream semantics are genuinely required

- **Status:** Accepted
- **Date:** 2026-09-17
- **Deciders:** HELL
- **Normative source:** README.md §23.4, §90, §100

## Context

> **Outstanding.** The decision below is recorded from README.md, which README §2 establishes as the architecture authority. This file exists so the decision is discoverable and supersedable in the normal way. The forces and measurements that justify it have not yet been written out here.

## Decision

SQS is the default queue. Kafka/MSK is adopted only for retained event streams, historical replay, independent consumer groups, partition ordering, sustained high throughput or stream processing. Kafka is never used as a job queue.

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

- README.md §23.4, §90, §100
- `docs/architecture/adr/0000-template.md`
