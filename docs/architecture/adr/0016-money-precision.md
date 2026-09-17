# ADR-0016: Monetary precision representation

- **Status:** Accepted
- **Date:** 2026-09-17
- **Deciders:** HELL
- **Normative source:** README.md Constitution §4.3, §14.1

## Context

> **Outstanding.** The decision below is recorded from README.md, which README §2 establishes as the architecture authority. This file exists so the decision is discoverable and supersedable in the normal way. The forces and measurements that justify it have not yet been written out here.

## Decision

Settled amounts are bigint counts of ISO 4217 minor units. Rates and intermediate calculations use arbitrary-precision decimals. Binary floating point is never an authoritative money representation. Implemented in packages/financial-engine; enforced by the finch/no-float-money ESLint rule.

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

- README.md Constitution §4.3, §14.1
- `docs/architecture/adr/0000-template.md`
