# ADR-0035: Nebius x NVIDIA hackathon as the first delivery program

- **Status:** Proposed
- **Date:** 2026-09-28
- **Deciders:** HELL, Nairy
- **Supersedes:** none. Temporarily re-sequences README §84 (24-Week Program) and adds a scoped exception to ADR-0026.

## Context

FINCH is at maturity M0 (scaffold): about 1,600 lines of TypeScript (Money, the formula
registry, contracts, config) plus the architecture baseline. The founders need funding and
external validation. The Nebius x NVIDIA Global AI Hackathon (submission deadline 2026-10-30
10:00 PT; judging 2026-12-01 to 12-15) offers USD 20,000 / 10,000 / 6,000 overall prizes, a
Jetson Orin Nano per track and USD 3,000 for Best Use of Tavily. It requires:

- a working app that makes runtime calls to Nebius Token Factory (or runs on Nebius AI Cloud);
- at least one NVIDIA open model;
- a public repository with an OSI license;
- a hosted demo that stays available until judging ends;
- a video of 3 minutes or less;
- English materials.

The README §84 program sequences 24 weeks starting from infrastructure (AWS, IaC, IdP). Following
it literally would give no demonstrable product by 2026-10-30.

The team is now two human developers (HELL and Nairy), with about 4.5 weeks of build time.

## Decision

FINCH adopts the hackathon as its first delivery program, specified in `docs/hackathon/`. The
program builds a vertical slice of README §83 Slices 1–3, extended with:

- an always-on watcher;
- proof-carrying answers (no model-authored numbers);
- a Nemotron second opinion;
- Tavily-sourced market reference data.

It is submitted to the **Personal AI track**. The slice is implemented inside the existing
monorepo and respects every Constitution clause and package boundary. What is reduced is the
deployed topology (ADR-0038) and the feature set, never the invariants.

The capability ceiling is risk tier R2: drafts only, no money movement (ADR-0021).

After submission, `main` is frozen at tag `v0.1.0-hackathon` until 2026-12-15 so the judged
artifact stays stable. Development continues on a `next` branch; this is a time-boxed exception
to ADR-0026. Afterwards the remaining README §84 work resumes from the state the hackathon leaves.

Two new trust boundaries and one new core vendor are introduced and recorded here, as README §76
requires:

- **Tavily** (public web content entering the system as untrusted data);
- a **Telegram** webhook channel;
- an optional **MCP server** (`apps/mcp`) exposing calculation-only skills.

## Alternatives considered

- **Follow README §84 as written.** Rejected: nothing demonstrable before the deadline, and it
  foregoes funding and validation.
- **A separate throwaway hackathon repository.** Rejected: it duplicates work, discards the
  architecture already paid for, and whatever is built would be rebuilt later. A separate repo
  would also weaken the "real company" story for judges and investors.
- **Best Apps & Agents track.** Kept as plan B. It is the most crowded track; Personal AI fits
  FINCH's privacy, memory and always-on thesis more specifically (`docs/hackathon/01`).

## Consequences

### Positive

- Forces the first real vertical slice, with an external deadline and expert judges.
- The engine, gateway, receipts and evals built now are production foundations, not demo code.

### Negative

- Infrastructure maturity (AWS, IaC, IdP) is deferred to Q1 2027.
- Code is made public before incorporation (see ADR-0037).

### Neutral / accepted trade-offs

- Web plus Telegram only; the native clients (ADR-0004, ADR-0006) are deferred.

## Security impact

New inbound channel (Telegram webhook), new outbound dependency (Tavily) and public demo
exposure. Mitigations: signed webhook secret, content treated as data, rate limits, a credit
guard and ephemeral demo workspaces. A threat model is required: `docs/architecture/threat-models/hackathon-demo.md`.

## Privacy impact

Demo personas are synthetic. Private workspaces redact PII before any model call, expose memory
to the user, and support export and delete. Demo uploads are deleted after 7 days.

## Cost

The inference credits for Token Factory and Tavily come from the hackathon and Builders Program.
Cash budget is capped by founders' decision D-08 (proposed USD 100).

## Migration

Not applicable (greenfield slice).

## Rollback

The track can be switched in Devpost until the deadline. The scope cut list is in
`docs/hackathon/05` §5. The freeze exception to ADR-0026 ends on 2026-12-15 by construction.

## References

- `docs/hackathon/README.md` and 00–07
- Nebius x NVIDIA Global AI Hackathon Official Rules (Devpost)
- README §76, §83, §84, §100, §106
