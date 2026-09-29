# 05 — Roadmap and timeline

Scope: **[08-feature-catalog.md](08-feature-catalog.md)** — **45 H features** (all complete); the
**P** features stay documented. Conventions: **H** = HELL, **I** = Irene. Every PR is reviewed by
**the other founder** (README §100). Feature IDs (A1, B1…) follow the catalog.

---

## 0. Capacity vs effort (honest)

**Capacity:** 2 people × 8+ h/day × 6 days/week × ~4.5 weeks (28 Sep → 29 Oct) ≈ **430 h** (≈ 500 h
working Sundays too). Claude and Cursor speed up implementation and review, but do not replace tests
or decisions.

**Estimated effort (person-hours):**

| Block                                                                                   | h         | Main owner          |
| --------------------------------------------------------------------------------------- | --------- | ------------------- |
| Foundation (repo, CI, deploy, license, credits, walking skeleton)                       | 25        | H                   |
| Premium design system, app shell, navigation, PWA, onboarding                           | 45        | I                   |
| Engine: CO credit + personal finance (≈ 25 formulas with vectors)                       | 55        | H (+ I vectors)     |
| AI Gateway, tiered agent, receipts, verifier, Ultra, memory                             | 45        | H                   |
| Market Truth with Tavily (usury, rates, credit, deposits, FX, plans, remittances, DIAN) | 35        | H                   |
| Capture: import, receipts by photo, vault, inbound email                                | 40        | H + I               |
| B — Manage (Payday, envelopes, cards, calendar, close, income, health, net worth)       | 55        | I (UI) + H (engine) |
| C — Decide (afford, what if…, storm, goals, investment)                                 | 35        | I + H               |
| D — Find money (Opportunity, subscriptions, anomalies, fixed costs, remittances)        | 48        | H + I               |
| E3 search · F1 household · F2 protection · G1 habits · G2 briefing                      | 40        | H + I               |
| F3 passport · F4 rights (8 cases) · F5 full CO taxes · G4 full second country           | 55        | H + I               |
| Watcher (Serverless Jobs), app push, .ics, full email (inbound and outbound)            | 25        | H                   |
| Privacy, security, threat model                                                         | 15        | H                   |
| Evals (datasets, batch, Toloka, LangSmith)                                              | 25        | I + H               |
| Polish, bug bash, video, README, Devpost                                                | 35        | I + H               |
| **Total**                                                                               | **≈ 578** |                     |

**Conclusion (honest):** with everything at H, effort (~580 h) exceeds capacity (430–500 h) by
**~15–35 %**. It becomes viable under four conditions:

1. **Work 7 days** in weeks 2 and 3 (≈ 500 h) and use Claude/Cursor intensively for repetitive
   implementation (catalog UI, templates, tests), always with human review.
2. **Order by value:** the demo is submittable at the end of every week.
3. **Contingency plan (§5)** applied without debate on the Monday after a missed milestone: no
   feature is removed; its **polish is deferred** in a predefined order.
4. Nothing outside the catalog until 29 Oct.

## 1. Milestones

| Milestone                         | Date                 | What must be live at the public URL                                                                                                                                             |
| --------------------------------- | -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **M0: Walking skeleton**          | Sun 4 Oct            | Navigable app shell (5 destinations), 3-question onboarding, `/api/health` with Nemotron, one chat turn via Token Factory, green CI, automatic deploy.                          |
| **M1: "My paycheck arrived"**     | Sun 11 Oct           | Payday Autopilot with receipts, envelopes, cards, calendar, can I afford it?; agent with skills and verifier. **Demo already submittable.**                                     |
| **M2: Market + capture + decide** | Sun 18 Oct           | Tavily (usury, credit, CDTs, FX), Opportunity Engine, subscriptions + anomalies, receipts by photo, import, what if…, storm, goals, investment, Decision Cards + Ultra, memory. |
| **M3: Release candidate**         | Sun 25 Oct           | Vault, NL search, shared household, protection, habits, briefing, Watcher on Serverless Jobs, push, .ics, email; D3–D5, F3–F5, G4 complete; evals published; English README.    |
| **M4: Code freeze**               | Tue 27 Oct 18:00     | P0 only.                                                                                                                                                                        |
| **M5: Submission**                | Thu 29 Oct 18:00     | Devpost complete; tag `v0.1.0-hackathon`.                                                                                                                                       |
| Official deadline                 | Fri 30 Oct 12:00 COT | Buffer.                                                                                                                                                                         |
| Judging                           | 1–15 Dec             | Demo live, funded, monitored.                                                                                                                                                   |

## 2. Week by week

### Week 0 — Foundation (Mon 28 Sep → Sun 4 Oct)

| ID    | Task                                                                                                                                                                                     | Owner | Due    |
| ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- | ------ |
| S0-01 | Approve plan, catalog and ADR-0035…0039; resolve D-01…D-04, D-10, D-11, D-12 (07).                                                                                                       | H+I   | Mon 28 |
| S0-02 | Team on Devpost (HELL Representative), Personal AI track, draft saved.                                                                                                                   | H     | Mon 28 |
| S0-03 | Credits: each founder with **their own** account (TF promo, Builders: TF, Tavily, LangSmith, Toloka, Academy). Never extra accounts (00 §8). Record balances in `credits.md`.            | H+I   | Tue 29 |
| S0-04 | Apache-2.0 license + NOTICE + TRADEMARKS; `security:check`; public repository (D-01).                                                                                                    | H     | Wed 30 |
| S0-05 | `GET /v1/models`: confirm L/S/U/V/E/guard IDs in ADR-0036.                                                                                                                               | H     | Tue 29 |
| S0-06 | Verify topology A vs B (ADR-0038) and email provider (ADR-0039).                                                                                                                         | H     | Fri 2  |
| S0-07 | **Walking skeleton**: API health + Nemotron chat; web shell; CI; deploy.                                                                                                                 | H     | Sun 4  |
| S0-08 | **Premium design system**: tokens (§6), typography, base components (button, card, receipt sheet, truth badges, envelopes, charts), motion, dark mode; wireframes of the 5 destinations. | I     | Thu 1  |
| S0-09 | App shell + navigation + 3-question onboarding + installable PWA (manifest, logo icons).                                                                                                 | I     | Sun 4  |
| S0-10 | Research: 3–5 official figures with URL; 5 short interviews.                                                                                                                             | I     | Sun 4  |
| S0-11 | Devpost clarification (prize stacking); Nebius office hours (VERIFY list).                                                                                                               | H     | Tue 29 |
| S0-12 | Irene in AGENTS.md and CODEOWNERS; branch protection.                                                                                                                                    | H     | Tue 29 |
| S0-13 | Decimal library (fractional powers) — note in ADR-0016.                                                                                                                                  | H     | Thu 1  |
| S0-14 | DB schema v1 (twin, envelopes, cards, transactions, documents, receipts, cards, memories, shared workspaces, audit) + persona seeds.                                                     | H+I   | Sun 4  |

### Week 1 — "My paycheck arrived" (Mon 5 Oct → Sun 11 Oct)

| ID    | Task                                                                                                                                                            | Owner                  | Due    |
| ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ------ |
| S1-01 | CO credit engine (colombia-credit.md §1–8).                                                                                                                     | H                      | Wed 7  |
| S1-02 | Personal finance engine: `budget.allocate`, `envelope_state`, `purchase.afford`, `health.score`, `networth.compute`, `cards.status` (personal-finance.md §1–5). | H                      | Fri 9  |
| S1-03 | **Independent golden vectors** in a spreadsheet (without looking at the code).                                                                                  | I                      | Fri 9  |
| S1-04 | AI Gateway: tiers, PII redaction, prompt registry, zod, audit, budget, kill switch.                                                                             | H                      | Thu 8  |
| S1-05 | Agent + skills + `CalcReceipt` + `ProofCarryingAnswer` + verifier + streaming.                                                                                  | H                      | Sun 11 |
| S1-06 | **Today** and **Money** UI (envelopes B2, cards B3, income B6, health B7, net worth B8), **calendar** B4, receipt panel.                                        | I                      | Sun 11 |
| S1-07 | **Payday Autopilot (B1)** end to end: detection (button + pasted notification), plan, sliders, checklist.                                                       | H (engine/AI) + I (UI) | Sun 11 |
| S1-08 | **Can I afford it? (C1)**.                                                                                                                                      | H + I                  | Sun 11 |
| S1-09 | Demo threat model.                                                                                                                                              | H                      | Fri 9  |

### Week 2 — Market, capture and decide (Mon 12 Oct holiday → Sun 18 Oct)

| ID    | Task                                                                                                                                       | Owner                 | Due    |
| ----- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ------ |
| S2-01 | Market Truth (T): usury, reference rates, credit, CDTs/savings, **FX (G3)**; allowlist, deterministic parsing, cache, freshness, fallback. | H                     | Wed 14 |
| S2-02 | **Opportunity Engine (D1)** + `deposit.net_return` + Opportunities UI.                                                                     | H + I                 | Fri 16 |
| S2-03 | Import (E4) + **subscriptions (D2)** + **anomalies (D3)** with a per-user baseline.                                                        | H                     | Thu 15 |
| S2-04 | **Receipts and invoices by photo (E1)**: PWA camera, V extraction, confirmation.                                                           | H (pipeline) + I (UI) | Sat 17 |
| S2-05 | Decision Cards + **Ultra second opinion (A5)**.                                                                                            | H                     | Thu 15 |
| S2-06 | Simulators: **What if… (C2)**, **storm (C3)**, **goals (C4)**, **investment (C5)**.                                                        | I (UI) + H (engine)   | Sun 18 |
| S2-07 | Memory (A7) + "What FINCH knows about you".                                                                                                | H + I                 | Sat 17 |
| S2-08 | E2/E3/E4 eval datasets (including E3 search and receipt questions).                                                                        | I                     | Sun 18 |
| S2-09 | **Rights copilot (F4)**: 8 cases, PDF documents, deadline tracking.                                                                        | I (flows) + H (PDF)   | Sun 18 |

### Week 3 — Complete every H (Mon 19 Oct → Sun 25 Oct)

| ID    | Task                                                                                                                        | Owner                    | Due    |
| ----- | --------------------------------------------------------------------------------------------------------------------------- | ------------------------ | ------ |
| S3-01 | **Vault (E2)** with expiry dates and reminders.                                                                             | H + I                    | Tue 20 |
| S3-02 | **NL search (E3)** with a bounded DSL + authorization tests.                                                                | H                        | Tue 20 |
| S3-03 | **Shared household (F1)**: memberships, what is shared, splitting, settlement, shared goals.                                | H (auth/engine) + I (UI) | Thu 22 |
| S3-04 | **Protection radar (F2)** + **habits (G1)** + **month-end close (B5)**.                                                     | I + H                    | Thu 22 |
| S3-05 | **Watcher (A11)** on Nebius Serverless Jobs + **briefing (G2)** + **app push (H1)** + **.ics (H2)**.                        | H + I                    | Wed 21 |
| S3-06 | **Email (H3)**: inbound (notifications, invoices, documents → E1/E2/E4) and outbound (briefing, alerts, branded templates). | H                        | Fri 23 |
| S3-07 | **Fixed costs (D4)**, **remittances (D5)**, **passport (F3)**, **CO taxes (F5)**, **second country (G4)** — complete.       | H + I                    | Sat 24 |
| S3-08 | Full evals (batch) + LangSmith + **Toloka** (set up Monday 19, results Friday 23) + harden guardrails.                      | I + H                    | Sat 24 |
| S3-09 | Demo operations: uptime, alerts, credit guard, backups, runbook.                                                            | H                        | Fri 23 |
| S3-10 | Premium polish (motion, states, accessibility, responsive, dark mode).                                                      | I                        | Sun 25 |
| S3-11 | Video script and storyboard; English README (draft); THIRD_PARTY and media licenses.                                        | I + H                    | Sun 25 |

### Week 4 — Freeze and submission (Mon 26 Oct → Fri 30 Oct)

| Day    | H                                                                 | I                                                                          |
| ------ | ----------------------------------------------------------------- | -------------------------------------------------------------------------- |
| Mon 26 | Bug bash with 5 testers on phones; P0/P1.                         | Coordinates the bug bash; fixes UI.                                        |
| Tue 27 | **18:00 code freeze**; tag `v0.1.0-rc`.                           | Video capture on the RC.                                                   |
| Wed 28 | Technical voice-over; final README; Devpost feedback.             | Editing, English subtitles, YouTube **public**; Devpost text; screenshots. |
| Thu 29 | Checklist 00 §4; tag `v0.1.0-hackathon`; **submit before 18:00**. | Verification in an incognito window.                                       |
| Fri 30 | Buffer (deadline 12:00 COT).                                      | Buffer.                                                                    |

## 3. Critical path

```text
S0-05 → S0-07 → S1-04 → S1-05 (agent+receipts) → S1-07 (Payday) → S2-05 (cards+Ultra)
S1-01/S1-02 (engine) ─────────────────────────┘
S2-01 (Tavily) → S2-02 (Opportunity) → S3-05 (Watcher)
S0-14 (DB) → S3-03 (shared household: authorization)
S2-08 (datasets) → S3-08 (evals) → README / video
```

Delay risks: S1-05 (verifier), S2-01 (official sources), S2-04 (multimodal extraction quality),
S3-03 (shared authorization). Each has a plan B documented in 07.

## 4. After submission

| Period          | What                                                                                                                                                                                   | Owner    |
| --------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 31 Oct → 15 Dec | `main` frozen at `v0.1.0-hackathon` (exception to ADR-0026, ADR-0035); development continues on `next`; demo only from the tag.                                                        | H        |
| November        | 30 interviews; landing page with waitlist; pitch deck; S.A.S. and trademark (D-05, D-09); data policy (VERIFY with a lawyer); start WhatsApp Business onboarding (H6) after the S.A.S. | I + H    |
| November        | Startup programs (NVIDIA Inception, Nebius; VERIFY requirements).                                                                                                                      | H        |
| 1–15 Dec        | Daily judging on-call.                                                                                                                                                                 | Rotation |
| 16 Dec → 10 Jan | Merge `next` → `main`; native apps continue in the delivery order (web → Windows → Android → macOS + iOS).                                                                             | H + I    |
| ~11 Jan 2027    | Winners; affidavits within 10 business days.                                                                                                                                           | H        |

## 5. Contingency plan (when a milestone is missed)

No feature leaves the scope. If a milestone is not green on a Sunday, the next step on this list
(and only that one) is applied on Monday and re-evaluated the following Sunday:

1. **G4** second country: delivered with the demo persona and FX/remittances, leaving D1 local
   products for week 4.
2. **D4** fixed costs: 3 categories instead of all.
3. **F5** income-tax estimator: shown as a simulation of the general schedule without advanced
   deductions.
4. **F4** copilot: 5 polished cases, 3 cases with a standard template.
5. Advanced visual polish (motion, illustrations) of secondary screens moves to week 4.

**Untouchable:** A1–A11, B1–B3, C1, D1, D2, E1, E2, F1, H1 and demo stability.

## 6. Brand tokens (derived from the logo)

The source of truth is `packages/design-tokens` (ADR-0041); this table is a summary.

| Token             | Hex       | Use                                      | Measured contrast                |
| ----------------- | --------- | ---------------------------------------- | -------------------------------- |
| `brand.green.900` | `#0E4331` | Logo, brand text, primary in light theme | 11.25:1 on `#FFFFFF`             |
| `brand.green.950` | `#053F2B` | Brand background (inverted logo)         | 11.48:1 with `#FAFAFA`           |
| `brand.green.600` | `#1F7A55` | Primary button (light theme)             | 5.29:1 on white (AA normal text) |
| `brand.green.300` | `#6FCF97` | Accent in dark theme                     | 6.3:1 on `#053F2B`               |
| `surface.dark`    | `#0B1A14` | Dark theme background                    | `#A7E3C1` on it: 12.29:1         |

Semantic tokens (`positive`, `negative`, `warning`, `verified`, `estimated`, `stale`, `pending`)
carry an icon and text in addition to color (README §34–35). Logos in `assets/brand/`.

## 7. Company roadmap 2027

| Quarter     | Goal                           | Gate (README §106) | Key deliverables                                                                                                                                                                               |
| ----------- | ------------------------------ | ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Q1 2027** | Closed alpha (≈ 50 users)      | A + B              | Final IdP (ADR-0015), production cloud (ADR-0012 vs Nebius with data), **native apps (P1)**, production hardening of the 45 features, third-party-audited formulas, WhatsApp and SMS (H5, H6). |
| **Q2 2027** | Closed beta (≈ 500) + pre-seed | C + D              | **Open finance / aggregator (P2)**, FINCH Premium subscription (D-12), retention, third country, MCP (P6).                                                                                     |
| **Q3 2027** | Actions with partners          | E                  | R2 flows with partners (balance transfers, CDTs), micro-businesses (P10), retirement (P4), ISO 27001 / SOC 2 readiness.                                                                        |
| **Q4 2027** | Public launch; seed round      | —                  | Growth, SLOs; evaluation of **execution with a regulated partner (P3)** toward Gates F/G.                                                                                                      |
