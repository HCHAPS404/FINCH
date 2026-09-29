# ADR-0040: Engineering method (XP + Agile + CRISP-ML(Q)) and stage branching

- **Status:** Proposed
- **Date:** 2026-09-28
- **Deciders:** HELL, Irene
- **Supersedes:** amends ADR-0026 (trunk-based development) for the hackathon program; moves the
  Constitution from the root `README.md` to `docs/architecture/CONSTITUTION.md`.

## Context

The hackathon program (ADR-0035) now covers 45 full-quality features built by two founders in about
four and a half weeks, with AI coding tools. Three needs arise:

1. A delivery method that keeps quality high at speed and makes weekly milestones explicit.
2. A lifecycle for the AI components (routing, extraction, agent, judge) that treats prompts and model
   choices as versioned, evaluated artefacts rather than ad-hoc strings.
3. A branching model that lets each weekly stage integrate safely while `main` always holds a
   demonstrable, milestone-validated product — the public demo is deployed from it.

Separately, the root `README.md` must become the public, English product documentation required by
the hackathon rules and expected by judges; the Spanish engineering constitution needs a stable home.

## Decision

1. **Method.** FINCH adopts Extreme Programming practices (mandatory TDD for the financial engine,
   authorization, the receipt verifier and the query DSL; pair work on critical code; continuous
   integration; small releases; collective ownership; sustainable pace) inside a one-week Agile
   cadence (planning Monday, daily, review + retro Sunday, Kanban with WIP ≤ 2 per person).
2. **AI lifecycle.** Every AI component follows CRISP-ML(Q) with the phase gates defined in
   `docs/architecture/SOFTWARE-ARCHITECTURE.md` §5. Prompt or model changes create new versions and
   pass evaluation before activation.
3. **Branching.** Three levels below `main`:
   - `stage/sN-<name>` — weekly integration branch, merged into `main` at its milestone (Sunday
     review) and then deleted;
   - `area/<area>` — platform or discipline lane with a fixed owner: `area/design`, `area/backend`,
     `area/web` (Next.js PWA), `area/mobile` (Expo: iOS and Android), `area/desktop` (Tauri:
     Windows, macOS and Linux). An area merges the active stage branch daily and delivers to it by
     PR at least every two days;
   - task branches `feat|fix|test|chore|docs|security|spike/sN-<slug>` from their area (or from the
     stage for cross-cutting work), living at most two days and merged by PR reviewed by the other
     founder.
     `main` is protected and always deployable. `release/v0.1.0-hackathon` is cut at the code freeze;
     `next` carries work after submission. CI runs on pull requests to `main`, `stage/**` and
     `area/**`.
4. **Documentation layout.** The Constitution moves to `docs/architecture/CONSTITUTION.md`; existing
   `README §N` references keep their meaning and point to it. The root `README.md` is the public
   product documentation (English); `README-DEVELOPERS.md` is the founders' working agreement.

## Alternatives considered

- **Pure trunk-based development (ADR-0026 as written).** Best practice for mature CI and feature
  flags, but with two people building 45 features in parallel, direct merges to `main` would put
  half-built screens on the public demo. Stage branches give a weekly integration buffer. Kept as the
  target model after the hackathon.
- **GitFlow with a permanent `develop`.** Rejected: long-lived branches and heavier ceremony than two
  people need; CONTRIBUTING forbids a permanent `develop` without an ADR.
- **Scrum with two-week sprints.** Rejected: the whole program is four and a half weeks; weekly
  feedback against the public URL is more valuable.
- **No formal ML lifecycle.** Rejected: prompts and model choices drive user-visible quality and cost;
  without versioning and gates, regressions are invisible.

## Consequences

### Positive

- Weekly, demonstrable milestones; `main` is always the best shippable state.
- AI quality becomes measurable and reproducible.
- The public README can serve judges and users without disturbing the constitution.

### Negative

- A weekly stage merge can conflict with work that spans two stages; mitigated by keeping task
  branches ≤ 2 days and rebasing/merging from the stage branch daily.

### Neutral / accepted trade-offs

- ADRs 0001–0034 still cite `README.md §N`; they are historical records and are not rewritten.

## Security impact

Branch protection on `main` (required review from the other founder, required CI) and on stage
branches (required CI). No direct pushes to `main`.

## Privacy impact

None. Evaluation datasets remain synthetic; the CRISP-ML(Q) data phase adds an automatic PII check.

## Cost

Ceremony time ≈ 3 h/week per person. No tooling cost (GitHub Projects).

## Migration

Create the stage branches; update the PR gate triggers; move the constitution; update CLAUDE.md,
AGENTS.md, CONTRIBUTING.md and SECURITY.md pointers (done with this ADR).

## Rollback

Return to trunk-based development by deleting stage branches and targeting PRs at `main`.

## References

- ADR-0026, ADR-0035
- `docs/architecture/SOFTWARE-ARCHITECTURE.md`
- Studer et al., "Towards CRISP-ML(Q): A Machine Learning Process Model with Quality Assurance
  Methodology" (2021)
- Kent Beck, _Extreme Programming Explained_ (2nd ed.)
