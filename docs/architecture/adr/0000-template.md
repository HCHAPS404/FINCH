# ADR-0000: <Title>

- **Status:** Proposed | Accepted | Rejected | Superseded by ADR-XXXX | Deprecated
- **Date:** YYYY-MM-DD
- **Deciders:** <human decision-makers>
- **Supersedes:** <ADR-XXXX, or none>

> An ADR records a decision and the reasoning available at the time. It is never
> rewritten to look wiser in hindsight — it is superseded by a new one. README §76
> lists the changes that require an ADR before implementation.

## Context

What forces are at play? What constraint, requirement or problem makes a decision
necessary now? Include measurements where they exist; an ADR that rests on "it feels
cleaner" is not a decision record.

## Decision

State the decision in the active voice. One paragraph. Be specific enough that someone
can tell whether the codebase complies.

## Alternatives considered

For each: what it was, and the concrete reason it was not chosen. "We didn't have
time" is a legitimate reason and should be written down as one.

## Consequences

### Positive

### Negative

### Neutral / accepted trade-offs

## Security impact

What changes about the threat model, the trust boundaries, the blast radius? If
nothing, say so explicitly rather than omitting the section.

## Privacy impact

What data classes are involved? Does this change retention, purpose, consent or
residency?

## Cost

Direct (licences, infrastructure) and indirect (operational burden, cognitive load,
lock-in).

## Migration

How do we get from the current state to the decided state? What is the expand →
migrate → contract sequence, if any?

## Rollback

How do we undo this if it turns out to be wrong? If the answer is "we cannot", that
is the most important sentence in the document and it belongs here.

## References

Official documentation, benchmarks, prior art, related ADRs.
