# ADR-0029: Quarantine-first document processing

- **Status:** Accepted
- **Date:** 2026-09-17
- **Deciders:** HELL
- **Normative source:** README.md Constitution §4.7, §29

## Context

> **Outstanding.** The decision below is recorded from README.md, which README §2 establishes as the architecture authority. This file exists so the decision is discoverable and supersedable in the normal way. The forces and measurements that justify it have not yet been written out here.

## Decision

Uploads go through quarantine, MIME and magic-byte validation, malware scanning, SHA-256 hashing and protected storage before classification and extraction. The original is evidence; extraction and normalization are separate versioned artifacts. An unconfirmed document never triggers an irreversible monetary action.

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

- README.md Constitution §4.7, §29
- `docs/architecture/adr/0000-template.md`
