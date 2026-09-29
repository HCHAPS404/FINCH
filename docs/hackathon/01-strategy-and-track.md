# 01 — Strategy, track and prizes

## 1. Recommended decision: **Personal AI Track** + **Best Use of Tavily** bonus

### The four options

| Track                        | Fit with FINCH                                                                                 | Expected competition                                                                                 | Verdict                            |
| ---------------------------- | ---------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Coding & Agentic Engineering | None. FINCH is not a developer tool.                                                           | —                                                                                                    | ❌ Fails Stage One as a "rebrand". |
| Physical AI                  | None. No hardware; the video would need "key modules in action", which weakens the case.       | —                                                                                                    | ❌                                 |
| **Best Apps & Agents**       | High. "Copilot" or "workflow that runs itself".                                                | **Very high.** It is the generic track: everything that fits nowhere else lands here.                | ✅ Plan B                          |
| **Personal AI**              | **Very high and specific.** Every phrase of the definition has a FINCH counterpart (table §3). | Medium. Most entries will be email, calendar or notes assistants; a private personal CFO stands out. | ✅ **Plan A**                      |

**Why Personal AI beats Best Apps:**

1. **Differentiation.** Among generic personal assistants, a private financial one with verifiable
   numbers stands out. In Best Apps it would be one more app.
2. **FINCH's Constitution already is the track's thesis.** "Keeping your data under your control"
   maps to server-validated consent, data classification, PII redaction and export/delete
   (README §4.16, §31). "Reusable skills" maps to the financial engine exposed as versioned skills
   (README §14.2).
3. **The Grand Prize is decided across all tracks.** The track choice does not limit the top prize;
   it only defines who we compete with for the Jetson and how Stage One reads the fit.
4. **Best Apps also suggests Ultra/Nano/Super routing and Serverless.** FINCH uses both anyway, so
   nothing that track would value is lost.

**Plan A risk:** the track description mentions NemoClaw, OpenShell, Hermes Agent and Nebius
Serverless. It says "tools **such as**", so none is mandatory, but using at least one strengthens the
fit. Mitigation: **Nebius Serverless** is used (Jobs for the Watcher), and as a future perspective
(P6) FINCH is exposed as an **MCP server** so personal agents (Hermes Agent, OpenClaw/NemoClaw) can
use FINCH as their "financial brain" (see 08, P6) — integrating with NVIDIA's personal AI ecosystem
instead of competing with it.

## 2. Positioning

**Submission name:** _FINCH: your private, always-on personal CFO_ (Colombia first, global-ready).

**Tagline:** _"Nemotron explains. Math decides. Every number comes with a receipt."_

**Problem (to be backed by official sources; never invent figures):**

- Colombian consumers receive rates in incomparable formats: effective annual (EA), monthly (MV),
  nominal annual compounded monthly (NAMV) — plus insurance, handling fees and the 4×1,000
  transaction tax (GMF). The real cost of credit stays hidden.
- There is a legal ceiling, the **usury rate**, certified by the Financial Superintendence and
  updated periodically. Few people know whether their card is near the ceiling or whether a balance
  transfer would save them money.
- Generic financial chatbots **hallucinate numbers**. In personal finance, an invented number causes
  real harm.
- Research task (S0-10, Nairy): gather 3–5 official figures (SFC, Banco de la República, DANE, Banca
  de las Oportunidades) on consumer debt, card use and financial inclusion, **with URL and date**,
  for the description and the video. A figure without an official source is not used.

**Solution:** an always-on assistant that:

1. **Understands** the user's financial state (Financial Twin) from data the user controls.
2. **Decides** with deterministic, versioned math; models only route, extract, orchestrate and explain.
3. **Watches** reference rates, the usury cap and market offers every day (Tavily) and speaks up when
   something changes for or against the user.
4. **Acts** within safe limits (tier R2): drafts for balance-transfer or renegotiation letters,
   reminders and payment plans. **It never moves money.**

## 3. Track → feature traceability (goes into the judges' README)

| Personal AI Track phrase                         | FINCH feature                                                                                                                                                                                | Where it appears in the video |
| ------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------- |
| "always-on"                                      | **Watcher**: a daily Serverless Job that recomputes the Twin, checks the usury cap and offers, generates proactive Decision Cards and the briefing, and notifies through the app's own push. | 2:15                          |
| "private assistant"                              | Per-user workspace, explicit consent, PII redaction before any LLM, export/delete, "FINCH never trains models on your data".                                                                 | 0:12 and 2:00                 |
| "keeping your data under your control"           | "What FINCH knows about you": every fact with provenance, editable and deletable; visible audit.                                                                                             | 2:00                          |
| "persistent memory"                              | Financial Twin (versioned structured facts) + semantic memory of preferences and goals (pgvector).                                                                                           | 1:00                          |
| "reusable skills"                                | The financial engine exposed as versioned skills (schema-typed tools); later also via MCP.                                                                                                   | 0:12–0:40                     |
| "access to the tools and information you choose" | The user toggles sources and channels: Tavily (web), documents and vault, inbound email, calendar.                                                                                           | 1:40                          |
| "carry out tasks across your daily workflows"    | Payday Autopilot (month plan and checklist), receipts by photo, vault with expiry dates, household finances, letters and claims, daily briefing.                                             | 0:12, 1:40, 2:00              |
| "NVIDIA open source model"                       | Nemotron Lightning / Super / Ultra on Token Factory.                                                                                                                                         | Whole video                   |
| "Nebius Serverless"                              | Serverless Jobs for the Watcher (optionally a Serverless Endpoint for private inference).                                                                                                    | 2:15                          |

## 4. How each criterion is maximized

### Technological Implementation (tie-breaker 1)

- **Measured tiered routing:** latency, cost and quality table per model in the README, from real
  evals (not estimates).
- **Tool calling + structured outputs** with schema validation (zod) and bounded retry.
- **Deterministic number verifier** (100 % grounding published, with the pre-verifier rate reported
  honestly).
- Token Factory **batch inference** to run evals at lower cost.
- Green CI: lint, typecheck, engine tests with _golden vectors_, architecture fitness.
- Observability: LangSmith traces, cost per conversation.

### Design

- Complete, autonomous experience: onboarding → "my paycheck arrived" → month plan → decision →
  receipt → action → Watcher → in-app push.
- Branded design system (FINCH green #0E4331), light and dark themes, accessible (never color alone:
  truth-class badges with text and icon).
- Bilingual EN/ES UI, English demo for judges, COP formatting.

### Potential Impact

- Concrete audience: salaried or independent people who receive income and must manage debts,
  cards and goals; deep in Colombia, ready for more countries.
- The demo solves a real case — "is this balance transfer worth it?" — with the saving computed and
  shown in COP.
- A credible business path (no commissions biasing rankings, README §4.15).

### Quality of the Idea

- **Proof-carrying answers:** LLM answers must cite calculation receipts; what cannot be cited is
  not said.
- **Ultra as an auditing second opinion**, not a generator: it reviews the agent's plan and the
  Decision Card before the user sees it.
- **Tavily as "Market Truth":** allowlisted official domains, dual sources, freshness and provenance;
  web content is treated as untrusted data (prompt-injection defense).

## 5. What we will NOT do in the hackathon (and why)

- **Real bank connections or open finance:** contracts, certifications and time. Simulated with
  synthetic personas plus user-uploaded statements (PDF/CSV).
- **Money movement (R3):** forbidden by ADR-0021 and regulatory prudence.
- **Native apps:** the installable PWA with its own push covers the video's "device". Native apps
  follow the delivery order web → Windows → Android → macOS + iOS (`docs/delivery/DELEGATION.md`).
- **Production AWS infrastructure:** the demo uses Nebius plus simple hosting (ADR-0038).
