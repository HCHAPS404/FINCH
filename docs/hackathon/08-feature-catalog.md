# 08 — FINCH feature catalog

> **Status:** PROPOSED — approved in conversation by HELL on 2026-09-28; pending Irene's review.
> This catalog is the **single source** of scope. `02-product-spec.md` describes the experience and
> `05-roadmap-and-timeline.md` the sequence; on any scope conflict, this document wins.

## Levels

| Level | Meaning                                                                                                  |
| ----- | -------------------------------------------------------------------------------------------------------- |
| **H** | Ships in the hackathon **complete, at the highest quality level and polished**. May appear in the video. |
| **P** | After the hackathon. **Documented** here as product perspective (section P).                             |

> **Decision 2026-09-28 (HELL):** there are no "MVP" features. The 8 previously marked H-MVP (D3, D4,
> D5, F3, F4, F5, G4, H3) move up to **H** with their full scope.

Rules that apply to **every** feature (not repeated in each entry):

1. Every figure shown comes from a versioned formula and carries a **receipt** (Constitution
   §4.2–§4.5).
2. All AI output is `GENERATED_NARRATIVE`; what AI extracts from documents stays `ESTIMATED` until
   the user confirms it (`USER_ASSERTED`).
3. **FINCH never moves money** (R3/R4 out of scope, ADR-0021). It plans, controls, verifies and
   drafts; the user executes.
4. **Neutral** product rankings: no commission changes the order (Constitution §4.15).
5. Investment recommendations: **educational simulation**, never "buy X" (regulated advice).
6. The app is **autonomous**: no feature depends on an external channel (ADR-0039).
7. Market data via Tavily/official sources: with URL, date and freshness; when there is no data,
   FINCH says so — it never invents.

Model legend: **L** = Nemotron 3.5 Lightning · **S** = Nemotron 3 Super · **U** = Nemotron 3 Ultra ·
**V** = NVIDIA multimodal (VERIFY availability) · **E** = embeddings · **T** = Tavily. Owner: **H** =
HELL, **I** = Irene (proposal; see 05).

---

## Scope summary

| Module                        | H (hackathon, complete)                                                                                                                     | P (documented)                     |
| ----------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| **A. Trust core**             | A1–A11                                                                                                                                      | —                                  |
| **B. Manage money**           | B1 Payday Autopilot · B2 Envelopes · B3 Cards · B4 Calendar · B5 Month-end close · B6 Multiple incomes · B7 Financial health · B8 Net worth | —                                  |
| **C. Decide**                 | C1 Can I afford it? · C2 What if…? · C3 Storm mode · C4 Goals · C5 Investment simulator                                                     | —                                  |
| **D. Find money**             | D1 Opportunity Engine · D2 Subscriptions · D3 Anomalies · D4 Fixed costs · D5 Remittances                                                   | —                                  |
| **E. Capture and organize**   | E1 Receipts and invoices by photo · E2 Vault · E3 Natural-language search · E4 Import                                                       | —                                  |
| **F. Share and protect**      | F1 Shared finances · F2 Protection radar · F3 Financial passport · F4 Rights copilot · F5 CO taxes                                          | —                                  |
| **G. Global experience**      | G1 Habits · G2 Briefing · G3 Multi-currency and live FX · G4 Second country                                                                 | —                                  |
| **H. Channels (Channel Hub)** | H1 Inbox + app push · H2 .ics calendar · H3 Inbound/outbound email                                                                          | H4 Telegram · H5 SMS · H6 WhatsApp |
| **P. Future**                 | —                                                                                                                                           | P1–P10                             |

**Hackathon total:** **45 H features** (P: 3 channels + P1–P10 documented). Effort and capacity in
05 §0.

---

## A. Trust core (H) — what makes FINCH different from any finance app

| ID  | Feature                     | What it does (summary; detail in 02 and 04)                                                                                       | Accepted when                                                      | Owner |
| --- | --------------------------- | --------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ | ----- |
| A1  | **Financial Twin**          | Versioned financial state: accounts, debts, cards, income, obligations, goals, assets; each fact with truth class and provenance. | Immutable snapshot with checksum; every fact shows its origin.     | H     |
| A2  | **Financial engine**        | Formulas in `docs/financial-formulas/` (CO credit + personal finance), versioned, with independent golden vectors.                | `pnpm financial:verify` green; vectors verified by I.              | H     |
| A3  | **Receipts + verifier**     | AI writes placeholders, not figures; a deterministic verifier blocks numbers without a receipt; clickable figures → receipt.      | E3 = 0 figures without a receipt in production.                    | H     |
| A4  | **Tiered agent**            | L routes/extracts · S orchestrates skills · U audits. Per-tier fallback down to a template.                                       | E2 ≥ 90 % correct tool calls (the real figure is reported).        | H     |
| A5  | **Second opinion (Ultra)**  | U reviews every Decision Card/action: APPROVE / WARN / BLOCK with visible findings.                                               | Findings rendered; BLOCK prevents the action.                      | H     |
| A6  | **Decision Cards**          | README §17 structure, persisted as data; prioritized inbox.                                                                       | Every recommendation from B–F comes out as a Decision Card.        | H+I   |
| A7  | **Controllable memory**     | Twin + memories (goals, preferences, constraints) with E; "What FINCH knows about you".                                           | Forgetting excludes the memory on the next turn (E2E).             | H+I   |
| A8  | **Privacy by design**       | PII redaction before the LLM, per-source consent, audit, export/delete everything.                                                | E4: 0 PII leaks to the provider.                                   | H     |
| A9  | **Published evals**         | E1–E6 (04 §7) + scorecard in the README.                                                                                          | `evals/RESULTS.md` with real numbers.                              | H+I   |
| A10 | **Bilingual, global-ready** | ES/EN; per-locale formats; country rules in `jurisdictions/`.                                                                     | Language/country switch without reloading state.                   | I     |
| A11 | **Always-on Watcher**       | Daily Nebius Serverless Job: recomputes, checks the market, detects events, generates cards + briefing.                           | Runs by itself at 06:00 local; "run now" in the UI; log with cost. | H     |

---

## B. Manage money (H) — the "intelligent administrative wallet"

### B1. Payday Autopilot — **video star**

- **What it does:** detects incoming income and within seconds proposes the **month plan**: how much
  goes to each obligation (with date), to debts (prioritized), to the emergency fund, to goals, to
  investing/saving and how much is left free. The user accepts, adjusts with sliders or asks for
  changes in natural language. It then generates the **execution checklist** ("transfer X to…") and
  verifies completion against subsequent transactions.
- **Income detection (any of):** (1) "Income arrived" button; (2) text/screenshot of the bank
  notification pasted or shared to the app (L/V extracts amount, date, source); (3) email forwarded to
  the private address (H3); (4) imported statement (E4); (5) learned usual date.
- **Engine:** `budget.allocate@1` — deterministic allocation by priority: obligations due before the
  next income → debt minimums → buffer up to target → goals by priority/date → surplus by debt or
  savings strategy. Configurable rule ("pay yourself first 10 %", "50/30/20", custom).
- **AI:** L extracts and classifies; S explains the plan and applies requested changes ("I want more
  for the trip"); U checks no obligation is left uncovered.
- **Accepted when:** with persona Laura, from "My paycheck arrived" to a plan with receipts < 10 s;
  the sum of allocations = income exactly (conservation verified by a test).
- **Limit:** FINCH does not move money; the user executes the checklist. Owner: H (engine/AI) + I (UI).

### B2. Envelopes and live budget

- **What it does:** virtual envelopes (home, groceries, transport, debts, savings, investing,
  leisure…) born from the B1 plan. Every recorded expense deducts; alerts at 80 % and 100 %; moving
  money between envelopes with one gesture (a record, not a real transfer).
- **Engine:** `budget.envelope_state@1`, conservation of totals.
- **Accepted when:** recording an expense updates the envelope, projected balance and safe-to-spend
  instantly. Owner: I (UI) + H (engine).

### B3. Credit-card control

- **What it does:** per card: limit, utilization %, cut-off and payment dates, balance at cut-off,
  cost of splitting into N instalments, interest accrued this month, minimum vs full payment and its
  cost, alert when the rate is near the usury cap (A2).
- **Recommendation:** which card to use for a purchase (by cut-off date → more interest-free days
  where applicable) and which to pay down first.
- **Accepted when:** each card shows "if you pay the minimum, you will pay X in interest this month"
  with a receipt. Owner: H + I.

### B4. Financial calendar

- All payments, cut-offs, incomes, expiries (E2) and goals in a calendar; holiday adjustment
  (`jurisdictions/*/calendar`); month view and "next 7 days". .ics export (H2). Owner: I.

### B5. Month-end close

- Automatic report at close: plan vs actual per envelope, B1 checklist completion, debts reduced,
  savings achieved, 3 learnings and the proposed adjustment for next month (Decision Card).
  Owner: I (UI) + H (engine).

### B6. Multiple incomes

- Salary, fees, rent, business, income in another currency. For variable income: a conservative
  projection (p25) marked `ESTIMATED`. Income diversification visible. Owner: H.

### B7. Financial health

- A 0–100 score, **explainable and deterministic** (`health.score@1`): debt-to-income, credit
  utilization, months of buffer, savings rate, payment punctuality, income concentration. Every
  component has a published weight, its receipt and "how to gain 5 points". Never a "credit score"
  (it does not replace credit bureaus). Owner: H + I.

### B8. Live net worth

- Assets (accounts, CDTs, investments, vehicle with estimated depreciation, declared property) −
  liabilities; monthly evolution; "what moved it". Multi-currency (G3). Owner: H + I.

---

## C. Decide better (H)

| ID  | Feature                              | What it does                                                                                                                                                                                                                                                | Engine / AI                                                                                           | Accepted when                                                            | Owner |
| --- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------ | ----- |
| C1  | **Can I afford it?**                 | Before buying: impact on the month, envelopes and goals; cash vs 1/12/36 instalments with real interest in pesos; opportunity cost; verdict "yes / yes but / better wait X days" with reasons.                                                              | `purchase.afford@1` (forecast + amortization). L understands "I want some headphones for 800k".       | Answer with receipts < 5 s; shows the date when it would be comfortable. | H + I |
| C2  | **"What if…?" simulator**            | Scenarios in natural language or sliders: income rise/loss, purchase on credit, moving, going independent, a child; effect over 12–60 months on debts, goals, buffer, net worth; up to 3 scenarios side by side.                                            | Simulation on a copy of the snapshot (never mutates state). S translates text → validated parameters. | Visual comparison of 3 scenarios with receipts.                          | H + I |
| C3  | **Storm mode**                       | "If I lose my income today": months of runway, order of cuts, debts to prioritize, what to ask the bank for (grace period, restructuring) and a week-by-week plan.                                                                                          | `stress.runway@1`. U reviews the plan.                                                                | Plan generated with exact runway and an action list.                     | H     |
| C4  | **Goals with trade-offs**            | Several goals with date and priority: feasibility, monthly contribution, probability under a conservative scenario and explicit trade-offs ("bringing the trip forward delays the down payment by 4 months").                                               | `goals.plan@1` (allocation by priority/date).                                                         | Changing a priority recomputes all of them with receipts.                | H + I |
| C5  | **Educational investment simulator** | Risk profile (questionnaire), projection of periodic contributions with scenarios (conservative/base/optimistic) and the effect of inflation and taxes; compares product classes (CDT, money-market fund, etc.) — **never** recommends a specific security. | `invest.project@1`. S explains; simulation legal copy.                                                | Projection with 3 scenarios and visible assumptions.                     | H     |

---

## D. Find money

### D1. Opportunity Engine (H) — credit, CDTs, savings, balance transfers

- **What it does:** (a) **best credit** for a need (amount, term) comparing **real total cost**, not
  just rate; (b) **balance transfer** for current debts; (c) **best CDTs and savings accounts** by
  **real net return** (after withholding tax and inflation) with term, liquidity and deposit-insurance
  coverage (VERIFY Fogafín conditions); (d) Watcher alerts when a better option appears.
- **Data:** T (Search + Extract) over public institution pages and official sources; domain
  allowlist; deterministic parsing; freshness; no third-party logos in the video.
- **Engine:** `credit.total_cost@1`, `credit.compare_refinance@1`, `deposit.net_return@1`.
- **Ranking:** deterministic and published (criteria and weights visible). If referral revenue ever
  exists, it is declared and does **not** enter the ranking.
- **Accepted when:** for Laura, top-3 CDTs and top-3 balance-transfer options with source, date and
  savings in pesos. Owner: H (data/engine) + I (UI). **Central use of Tavily.**

### D2. Subscription and recurring-charge detective (H)

- Detects subscriptions, duplicate charges, silent price rises, free trials that started charging,
  handling fees that went up; annual total in pesos; cancellation or claim draft (F4).
- **Engine:** `recurring.detect@1` (periodicity ± tolerance, amount, merchant normalized by L).
- **Accepted when:** on Laura's synthetic statement it detects ≥ 5 recurring charges and 1 price rise.
  Owner: H.

### D3. Anomaly detector (H)

- **What it does:** watches every new transaction and explains what is unusual, with a concrete next
  step.
- **Deterministic rules (versioned, `anomaly.scan@1`):** duplicate charge (same merchant and amount
  within < 48 h); new or increased bank fee or charge; foreign-currency purchase with an FX markup vs
  the reference rate (G3); out-of-pattern spend (> p95 of its category or z-score > 3 over its
  history); charge at a never-seen merchant above a threshold; charge after a recorded cancellation
  (D2); interest charged on a card the user marked as paid in full.
- **Per-user learning:** baseline per category and merchant with a rolling window; the user marks
  "this is normal" and the rule adjusts for them (personal threshold, audited).
- **Output:** Decision Card with evidence (transactions involved), severity and action: claim (F4),
  confirm, ignore. Integrated with the Watcher and push.
- **Accepted when:** on the synthetic anomaly dataset (≥ 30 planted cases + noise) precision and
  recall ≥ 90 % (the real figure is reported); every alert explains why, with a receipt. Owner: H.

### D4. Fixed-cost optimizer (H)

- **What it does:** reviews **all** detected fixed costs (D2/B2) — mobile plan, internet,
  TV/streaming, voluntary insurance, gym, services with comparable pricing — and searches for
  equivalent or better public alternatives.
- **How:** normalization of the current offer (L); T Search + Extract over public provider pages on
  the per-category allowlist; deterministic comparison by attributes (price, data, speed, coverage,
  lock-in/clauses) → annual savings with sources and date; Watcher alerts when a better option
  appears; draft change or cancellation request (F4).
- **Accepted when:** for Laura it finds alternatives in ≥ 3 categories with computed annual savings
  and sources; neutral ranking and visible criteria. Owner: H (data) + I (UI).

### D5. Remittance comparator (H)

- **What it does:** the real total cost of sending or receiving money between countries = fee + FX
  margin vs the reference rate (G3), in source currency and in %; exactly how much the recipient
  gets; speed and delivery method.
- **Coverage:** main corridors into Colombia (USA, Spain, Chile) and those of the second country (G4),
  for 4–6 services with public prices via T, with query date and time.
- **Extras:** simulation "if you send X every month, you lose Y a year in costs"; Watcher alert when
  the cost drops; income in another currency (Andrés) handled by the same engine.
- **Engine:** `fx.remittance_cost@1`, `fx.convert@1`. **Accepted when:** for 3 corridors it shows a
  ranking with exact costs and sources; amount conservation verified. Owner: H.

---

## E. Capture and organize (H)

### E1. Receipts and invoices by photo (H)

- **What it does:** photo of a receipt/invoice (phone camera via the PWA) or PDF → merchant, date,
  total, taxes, relevant items → suggested category and envelope → **confirmation** → expense
  recorded. Colombian electronic invoice (XML/PDF by email, H3): structured extraction; flags
  purchases relevant to income-tax deductions where applicable (VERIFY the current rule with the
  DIAN; F5).
- **AI:** V extracts; L normalizes merchant and category; deterministic validations (sum of items ≈
  total, valid date, currency).
- **Accepted when:** 10 varied synthetic receipts with ≥ 90 % correct fields before confirmation (the
  real figure is reported); confirmation is never skipped. Owner: H (pipeline) + I (camera and
  confirmation UI).

### E2. Document vault with expiry dates (H)

- **What it does:** stores policies, contracts (lease, credit), warranties, SOAT, vehicle inspection,
  statements, certificates; extracts **key dates and amounts**; reminders before expiry (30/7/1 days)
  in the calendar (B4) and inbox; search by content (E).
- **Security:** encrypted at rest, access only by the workspace owner (or explicitly shared in F1),
  quarantine on upload, real deletion on delete.
- **Accepted when:** uploading a synthetic SOAT creates its expiry and reminder after confirmation.
  Owner: H + I.

### E3. Natural-language search (H)

- "How much did I spend on delivery in August?", "which month did I spend most on transport?", "show
  me payments to my phone company this year". S translates into a **bounded query DSL** (filters,
  groupings, ranges) validated by schema — **never free SQL** —; the backend executes; answer with a
  table/chart and a query receipt.
- **Accepted when:** 30 questions from the E2 dataset with ≥ 90 % correct queries; 0 queries outside
  the workspace (authorization test). Owner: H + I.

### E4. Data import (H)

- CSV/XLSX/PDF (text) statements, pasted/shared bank notifications, quick manual entry.
  Deterministic deduplication; merchant normalization (L); everything with `IMPORT`/`DOCUMENT`
  provenance. Owner: H.

---

## F. Share and protect

### F1. Shared finances (H)

- **What it does:** shared workspace (couple, household, roommates) on the Principal / Party /
  Workspace / Membership model already designed (README §8, ADR-0010/0011). Shared expenses with
  split rules (equal parts, proportional to income, fixed amounts), "who owes whom" settlement with
  the minimum number of transfers, shared goals and envelopes. **Each person decides what to share**;
  the personal stays private.
- **Engine:** `split.settle@1` (minimal settlement, conservation of totals).
- **Accepted when:** the Pérez household (2 people) sees shared expenses, income proportion and a
  correct settlement; authorization test: a member never sees the other's unshared accounts.
  Owner: H (auth + engine) + I (UI).

### F2. Protection radar (H)

- **What it does:** assesses (a) emergency fund vs target (months of essential expenses); (b)
  financial dependants and existing coverage; (c) insurance already paid inside credits or cards
  (possible duplication); (d) uncovered risks. Result: a protection map with educational priorities.
  **It neither sells nor recommends insurers.**
- **Engine:** `protection.gaps@1` (published deterministic rules).
- **Accepted when:** for Laura it detects the credit life insurance duplicated across two loans and
  the insufficient buffer, with receipts. Owner: H + I.

### F3. Financial passport (H)

- **What it does:** a shareable document for landlords, banks or employers proving financial
  soundness **without exposing transactions**: average income and stability (3–12 months),
  debt-to-income, months of buffer, payment punctuality, financial health (B7) and optional net
  worth (B8).
- **User control:** chooses which indicators to include; a signed link that **expires** (24 h, 7 d,
  30 d) and is **revoked** in one tap; optional access code; a log of every opening (who, when,
  approximate location); PDF version with a verification code that validates against FINCH.
- **Honesty:** each indicator states its truth class (declared by the user, derived from imported
  statements, observed); never presented as a bank certification.
- **Accepted when:** create, open, expire and revoke work with security tests (revoked link → 410;
  tampered link → rejected). Owner: H + I (document design).

### F4. Financial consumer rights copilot (H)

- **What it does:** supports the user against their financial institution end to end.
- **Cases covered:** undue or unrecognized charge; unagreed fee/handling fee; insurance charged
  without authorization; balance-transfer or rate-renegotiation request; paid-in-full or debt
  certificate; negative credit-bureau report (financial habeas data right); unanswered claim;
  cancellation of products or subscriptions (D2/D4).
- **Flow:** guided diagnosis → route (institution → Financial Consumer Ombudsman → complaint to the
  SFC or competent authority) → **document** (petition, claim, request) as PDF with figures carrying
  receipts and evidence attached from the vault (E2) → **case tracking** with legal deadlines,
  reminders and suggested escalation if the deadline passes.
- **Legal framework:** cited with source and date (VERIFY with a lawyer: Law 1328 of 2009, the
  financial habeas data regime, response deadlines for petitions). Templates are reviewed before
  public launch.
- **Accepted when:** the 8 cases generate a document and a case with deadlines; U reviews every
  document. Owner: I (flows/templates) + H (PDF, cases, receipts).

### F5. Colombian taxes (H)

- **What it does:** complete personal tax awareness, always with an official source and marked
  `ESTIMATED`:
  - **Must I file income tax?** with the tax-year thresholds (assets, income, card spending,
    purchases, deposits) read from the official DIAN source via T; without a fresh source, it makes
    no claim.
  - **DIAN calendar** by the last digits of the ID document, with reminders (B4).
  - **Withholding tax** on returns (CDT, accounts) integrated into D1.
  - **GMF (4×1,000)** on flows, with the exempt account flagged if the user declares it.
  - **Individual income-tax estimator** (general schedule) with the most common exempt income and
    deductions (dependants, mortgage interest, prepaid medicine, voluntary contributions, purchases
    with electronic invoice — rules and caps VERIFY with an official source and an accountant), as a
    **simulation**.
  - **Filing documents checklist**, fed by the vault (E2) and invoices (E1).
- **Accepted when:** for Andrés it answers "must I file?" with source and date, generates the
  calendar and a simulation with visible assumptions; golden vectors of the rules verified against
  official examples. Owner: H (+ accountant review before public launch).

---

## G. Global experience and habits

| ID  | Feature                        | Level | What it does                                                                                                                                                                                                                                                                                                           | Owner |
| --- | ------------------------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----- |
| G1  | **Commitments and habits**     | H     | Challenges chosen by the user ("7 days without delivery", "virtual round-up to savings", "don't use card X this month") with progress in real pesos and a sober celebration; the Watcher follows up. No childish gamification.                                                                                         | I + H |
| G2  | **Daily and weekly briefing**  | H     | In the app every morning: 3 things that matter today (payments, alerts, opportunity); weekly: achievements, deviations, adjustment. Figures with receipts. Optionally by email too (H3).                                                                                                                               | I + H |
| G3  | **Multi-currency and live FX** | H     | Accounts, income and expenses in several currencies; exchange rates from official/reference sources with date and source (VERIFY provider: central bank/ECB/public API); net worth and budget consolidated in the base currency; FX markup on international purchases. `fx.convert@1` with provenance.                 | H     |
| G4  | **Complete second country**    | H     | Complete `jurisdictions/<country>/`: currency, holidays, rate conventions, official reference rates, interest cap if any, local savings/credit products for D1, remittance corridor (D5), legal copy and demo persona; proves FINCH scales without touching the core. Country: **decision D-11** (Mexico recommended). | H     |

---

## H. Channels — Channel Hub (ADR-0039)

The app is autonomous; channels are optional adapters with their own consent.

| ID  | Channel                         | Level | Scope                                                                                                                                                                                                                                                                                                                                                                                                     |
| --- | ------------------------------- | ----- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| H1  | **Inbox + the app's own push**  | H     | In-app inbox of Decision Cards and alerts; **Web Push** in the installable PWA (VERIFY iOS web-push support in an installed PWA); preferences per alert type; quiet hours. The main channel.                                                                                                                                                                                                              |
| H2  | **Calendar export (.ics)**      | H     | Private .ics subscription with payment/expiry dates (no amounts).                                                                                                                                                                                                                                                                                                                                         |
| H3  | **Email: inbound and outbound** | H     | **Inbound:** a private per-user address (rotatable) to forward bank notifications, electronic invoices and documents → E1/E2/E4, with guided automatic-forwarding rules, quarantine and untrusted content. **Outbound:** daily/weekly briefing and critical alerts with minimal PII and branded templates; preferences and one-click unsubscribe (transactional provider; VERIFY cost, domain, SPF/DKIM). |
| H4  | Telegram                        | P     | Optional adapter: questions and alerts. Design ready through the port; no priority.                                                                                                                                                                                                                                                                                                                       |
| H5  | SMS                             | P     | Inbound (forwarding bank SMS) and outbound critical alerts via a provider (VERIFY costs and numbering in CO).                                                                                                                                                                                                                                                                                             |
| H6  | WhatsApp                        | P     | WhatsApp Business Platform: requires business verification with Meta, approved templates and opt-in — starts after incorporating the company.                                                                                                                                                                                                                                                             |

---

## P. Future perspective (documented, not built in the hackathon)

| ID  | Feature                                                | Why it matters                                                                             | Condition to start it                                                                                 |
| --- | ------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- |
| P1  | **Native iOS/Android (Expo) and desktop (Tauri) apps** | Native push, widgets, biometrics, reading bank notifications on Android (with permission). | Q1 2027 (ADR-0004/0006); delivery order web → Windows → Android → macOS + iOS.                        |
| P2  | **Open finance / aggregator**                          | Automatic bank data, the end of manual loading.                                            | Provider chosen; VERIFY the regulatory status of open finance in Colombia.                            |
| P3  | **Automatic execution with a regulated partner**       | A Payday Autopilot that does move money (R3).                                              | Gates F/G, regulated partner, external review (ADR-0021).                                             |
| P4  | **Retirement projection**                              | Long-term planning.                                                                        | Model of the Colombian pension system verified with an official source and an expert (recent reform). |
| P5  | **Voice mode**                                         | Accessibility and convenience.                                                             | Voice model available on Nebius/NVIDIA (VERIFY).                                                      |
| P6  | **"FINCH Skills" MCP server**                          | FINCH as the financial brain of other personal agents.                                     | Post-hackathon; calculation-only skills.                                                              |
| P7  | **Dedicated private inference**                        | Sensitive documents processed on an own endpoint (Nebius Serverless Endpoint).             | AI Cloud budget.                                                                                      |
| P8  | **Extraction fine-tuning (LoRA)**                      | Better accuracy on Colombian documents.                                                    | A sufficient synthetic/consented dataset.                                                             |
| P9  | **Social security for the self-employed**              | Calculation and reminder of contributions.                                                 | Current rules verified with an official source.                                                       |
| P10 | **FINCH for micro-businesses**                         | `microbusiness_owner` persona: business cash flow separate from personal.                  | After validating the personal product.                                                                |

---

## Traceability to the judging criteria

| Criterion                    | Features contributing most                                                                                                     |
| ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Technological Implementation | A3, A4, A5, A11, E1 (multimodal), E3 (safe DSL), D1 (Tavily + parsing), A9 (evals)                                             |
| Design                       | B1, B2, B3, H1, C2, E2, G2 — complete, coherent, premium experience                                                            |
| Potential Impact             | B1, B3, C3, D1, D2, F2, F4 — savings and protection demonstrable in pesos                                                      |
| Quality of the Idea          | A3 (the model cannot write figures), A5 (Ultra auditor), F1 (shared finances with per-member privacy), F3 (revocable passport) |
| Best Use of Tavily           | D1, D4, D5, F5, G3 — real-time market data, cited and verified                                                                 |
