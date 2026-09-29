# FINCH × Nebius × NVIDIA Global AI Hackathon — Hackathon program

> **Status:** PROPOSED — requires approval from both founders (HELL and Nairy).
> **Date:** 2026-09-28
> **Submission deadline:** Friday 30 October 2026, 10:00 PT = **12:00 Colombia time** (17:00 UTC).
> **Build days available:** 32 (Monday 28 Sep to Thursday 29 Oct; 30 Oct is buffer only).

This directory turns FINCH — today a **scaffold with an approved architecture** — into a
**winning hackathon submission** without betraying the Constitution (README §4), while leaving
FINCH better positioned as a company. The hackathon is not a detour: it is the product's first
real _vertical slice_, with an external deadline and expert judges.

## Reading order

| #   | Document                                                                    | Purpose                                                                                       |
| --- | --------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 00  | [Rules and compliance](00-rules-and-compliance.md)                          | Official rules, a checklist for every requirement and the traps that disqualify.              |
| 01  | [Strategy, track and prizes](01-strategy-and-track.md)                      | Which track and why; how scoring works; which prizes are reachable.                           |
| 02  | [Product specification](02-product-spec.md)                                 | What "FINCH, your personal CFO" is: vision, premium principles, personas, flows, skills.      |
| 03  | [Architecture and Nebius/NVIDIA stack](03-architecture-and-nebius-stack.md) | Topology, components and how every Nebius/NVIDIA/Tavily/LangSmith/Toloka tool is used.        |
| 04  | [AI design, safety and evaluation](04-ai-design-safety-evals.md)            | Tiered Nemotron routing, agent, _proof-carrying answers_, guardrails and evals.               |
| 05  | [Roadmap and timeline](05-roadmap-and-timeline.md)                          | Day-by-day plan to submission, the judging period and the 2027 company roadmap.               |
| 06  | [Submission kit](06-submission-kit.md)                                      | Devpost text, 3-minute video script, judges' README structure, feedback.                      |
| 07  | [Risks and open decisions](07-risks-and-decisions.md)                       | Risks with mitigations, and the decisions **only the founders** can make.                     |
| 08  | [Feature catalog](08-feature-catalog.md)                                    | **Single source of scope:** 45 H features and the future perspective (P).                     |
| —   | [Colombia credit formulas](../financial-formulas/colombia-credit.md)        | Rate conversion, amortization, total cost and usury math: the engine contract.                |
| —   | [Personal-finance formulas](../financial-formulas/personal-finance.md)      | Payday, envelopes, health, net worth, decisions, net CDT return, FX, remittances, households. |

New ADRs (in `docs/architecture/adr/`):

- [ADR-0035](../architecture/adr/0035-hackathon-program-and-scope.md): hackathon program, scope and precedence over the 24-week program.
- [ADR-0036](../architecture/adr/0036-ai-runtime-nebius-token-factory-nemotron.md): AI runtime on Nebius Token Factory with tiered NVIDIA Nemotron, behind the AI Gateway.
- [ADR-0037](../architecture/adr/0037-open-source-license.md): open source license (hackathon requirement) and _open core_ strategy.
- [ADR-0038](../architecture/adr/0038-hackathon-demo-deployment-topology.md): demo deployment topology (scoped exception to ADR-0012).
- [ADR-0039](../architecture/adr/0039-channel-hub.md): autonomous app; email, SMS, WhatsApp and Telegram as optional channels.
- [ADR-0040](../architecture/adr/0040-engineering-method-and-branching.md): XP + Agile + CRISP-ML(Q) method and stage/area branching.
- [ADR-0041](../architecture/adr/0041-design-system-and-frontend-toolchain.md): design system, Figma channel and front-end toolchain.

Software architecture: [SOFTWARE-ARCHITECTURE.md](../architecture/SOFTWARE-ARCHITECTURE.md) ·
Founders' working agreement: [README-DEVELOPERS.md](../../README-DEVELOPERS.md).

## The thesis in one sentence

> **FINCH is a premium, private, always-on personal CFO: it plans your paycheck, controls your
> cards, stops you before a bad purchase and finds money you are losing. Nemotron reasons and
> explains, but no model ever invents a figure: every number comes with its receipt.**

This fits the **Personal AI Track** (a private, always-on assistant with memory, reusable _skills_
and tools the user chooses). It is also a direct answer to what the judges score — **Technological
Implementation, Design, Potential Impact and Quality of the Idea**, equally weighted.

## Plan summary

```text
Wk 0 (28 Sep → 04 Oct)  Foundation: license, credits, ADRs, walking skeleton in production with Nemotron
Wk 1 (05 Oct → 11 Oct)  Engine + agent with receipts + "My paycheck arrived" (Payday, envelopes, cards, calendar)
Wk 2 (12 Oct → 18 Oct)  Tavily + Opportunity Engine + receipts by photo + simulators + Ultra + memory
Wk 3 (19 Oct → 25 Oct)  Vault, search, household, protection, Watcher + push, email, D3–D5, F3–F5, G4, evals
Wk 4 (26 Oct → 30 Oct)  Code freeze 27 Oct · video 27–28 · submit 29 Oct · 30 Oct buffer
01 Dec → 15 Dec         Judging: the demo MUST stay live and funded
~11 Jan 2027            Winners announced
```

## Team

| Person                          | Hackathon role                                                                                                                      |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| **HELL** (Helmut, `@HCHAPS404`) | Team Representative on Devpost. Lead for backend, financial engine, AI Gateway, agent, Nebius infrastructure.                       |
| **Nairy** (co-founder)          | Lead for product/UX, web front end, branded design system, app shell and PWA, human evals (Toloka), video and submission narrative. |
| Claude / Cursor                 | Tools (AGENTS.md §1), never authors. Claude: architecture, specs, review. Cursor: multi-file implementation.                        |

The split is a **proposal**. If Nairy's strengths lie elsewhere, whole blocks of the timeline (05)
are swapped without breaking dependencies.
