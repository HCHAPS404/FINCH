# 02 — Product specification: FINCH, the premium personal CFO

> Full functional scope and levels (H / P): **[08-feature-catalog.md](08-feature-catalog.md)**.
> This document describes the **experience**: vision, premium principles, personas, navigation,
> flows and skills.

Risk tier (README §18): R0–R1 and a **bounded R2** (drafts, checklists, shareable links).
**FINCH never moves money.** Regulatory capability (README §37): `INFORMATION`, `COMPARISON`,
`SIMULATION`; personalized content is presented as educational simulation with explicit assumptions
(decision D-07).

---

## 1. Vision

**FINCH is the app that runs your financial life the way a personal CFO would**: it knows when your
money arrives, allocates it with judgement, controls your cards, stops you before a bad purchase,
finds money you are losing, searches the real market for better products and protects your
household — and **every number it shows you comes with its receipt**.

- **Autonomous:** everything happens inside FINCH (inbox, push, calendar, vault). Email, SMS,
  WhatsApp or Telegram are optional extras to bring information in or send it out (ADR-0039).
- **Global-ready, Colombia-deep:** multi-currency and live FX for everyone; Colombian rules in depth;
  a complete second-country pack proves the architecture scales.
- **Personal AI for real:** always-on, private, with controllable memory and reusable skills.

## 2. Premium principles (design acceptance criteria for every screen)

| Principle                | Verifiable criterion                                                                                                                |
| ------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| **Visible trust**        | Every figure is clickable → receipt; truth badges with text + icon (Verified · Declared · Calculated · Estimated · Stale).          |
| **Speed**                | Local interactions < 100 ms (optimistic UI); first AI token < 1.5 s (streaming); Lighthouse ≥ 90 for performance and accessibility. |
| **Calm by default**      | At most 1 push per day except critical alerts; quiet hours; every notification answers "what do I gain by opening it?".             |
| **First value in 60 s**  | 3-question onboarding (income, payday, main debt) → first month plan.                                                               |
| **Identity**             | FINCH green, editorial typography, 150–250 ms micro-animations, illustration built from the bird motif, first-class dark mode.      |
| **Designed states**      | Empty, loading (skeletons), error, offline, stale — designed for every screen.                                                      |
| **Accessibility**        | Keyboard navigation, screen readers, AA contrast, nothing conveyed by color alone (README §34–35).                                  |
| **Judgement**            | FINCH says "you're doing fine, do nothing" when that is the right answer.                                                           |
| **Privacy as a product** | "What FINCH knows about you", one-tap export/delete, no ads, no data sales.                                                         |

## 3. Demo personas (synthetic, README §80)

| Persona                                                  | Profile                                                                                                                         | Features it showcases                                                                                                                        |
| -------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| **Laura, 29, Medellín** (`credit_card_heavy`) — **star** | COP 4.2 M salary on the 30th; 2 cards (one near the usury cap); a personal loan; forgotten subscriptions; SOAT about to expire. | B1 Payday Autopilot, B3 cards, C1 can I afford it?, D1 balance transfer + CDT, D2 subscriptions, E1 receipts, E2 vault, F2 protection radar. |
| **Andrés, 34, Bogotá** (`freelancer_variable`)           | Variable income in COP **and USD** (foreign clients); rent; goals.                                                              | B6 multiple incomes, G3 multi-currency/FX, D5 remittances, C3 storm mode, F5 must I file taxes?                                              |
| **Pérez household** (`household_shared`)                 | Couple with two incomes; shared expenses; down-payment goal.                                                                    | F1 household finances, C4 goals with trade-offs, B5 month-end close.                                                                         |
| **Sofía, 31, second country** (G4 pack)                  | Persona for the second country.                                                                                                 | G4, G3, D1 local products.                                                                                                                   |

## 4. Navigation (information architecture)

Main bar (5 destinations, mobile first):

1. **Today** — briefing (G2), Decision Card inbox (A6), upcoming payments (B4), safe-to-spend.
2. **Money** — envelopes (B2), cards (B3), accounts and income (B6), net worth (B8), health (B7).
3. **FINCH** (center button) — conversation with the agent: ask, simulate (C1–C5), search (E3),
   capture (camera, E1).
4. **Opportunities** — market (D1), subscriptions (D2), anomalies (D3), fixed costs (D4),
   remittances (D5).
5. **Me** — goals (C4), household (F1), protection (F2), vault (E2), habits (G1), passport (F3), my
   cases (F4), taxes (F5), what FINCH knows about you (A7), Watcher (A11), channels and settings
   (H1–H3).

Cross-cutting: a **receipt panel** slides in from any figure; the **second opinion** is visible on
every Decision Card.

## 5. Main flows

### F-A. "My paycheck arrived" (video star)

```text
Laura shares the bank notification (or taps "Income arrived")
  → L extracts amount/date/source → one-tap confirmation
  → budget.allocate: obligations → minimums → pay-yourself-first → buffer → goals → free
  → S explains the plan with placeholders → verifier → U: "APPROVE_WITH_WARNINGS: card A is
    1.1 pp below the usury cap; consider a balance transfer"
  → Month plan with receipts + execution checklist + "balance transfer" Decision Card
  → envelopes created; calendar updated; tomorrow's briefing prepared
```

### F-B. "Can I afford it?"

Text or photo of the product → C1 → verdict (yes / yes with adjustment / wait until a date / not
recommended) + cash vs instalments with real interest → "create a goal" when waiting is better.

### F-C. Find money

Import a statement or forward emails → D2 finds recurring charges and a price rise → D3 flags a
duplicate charge → F4 drafts the claim → D1 finds a better CDT for the buffer.

### F-D. Market and balance transfer (original flow, extended)

Question → T brings the current usury cap and offers → engine: conversion, total cost, usury,
comparison → Decision Card with savings in pesos → U reviews → draft request (F4).

### F-E. Capture and vault

Receipt photo → E1 extracts → confirm → expense lands in its envelope. SOAT photo → E2 stores it and
extracts the expiry date → reminders 30/7/1 days before.

### F-F. Household

The Pérez couple: each person decides what to share → shared expenses split proportionally to income
→ minimal settlement → shared down-payment goal with trade-offs.

### F-G. Storm

"What if I lose my job?" → C3 runway with and without cuts → week-by-week plan → U reviews → action
Decision Cards (ask for a grace period, pause goals).

### F-H. Watcher and briefing

06:00 local → recompute everything → check the market (cached) → events → cards → in-app push with
minimal PII → briefing on "Today" (and by email if the user enabled it).

## 6. Agent skills (tools)

Every skill: stable name, version, zod schema → JSON Schema, output truth class, receipt.

| Group                    | Skills                                                                                                                                                                    |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Twin and memory          | `twin.get_snapshot` · `twin.record_fact`* · `memory.remember/recall/forget`                                                                                               |
| Credit (CO)              | `finance.convert_rate` · `finance.amortization_schedule` · `finance.total_cost_of_credit` · `finance.check_usury` · `finance.compare_offers` · `finance.debt_payoff_plan` |
| Money management         | `budget.allocate` · `budget.envelope_state` · `cards.status` · `calendar.upcoming` · `month.close` · `health.score` · `networth.compute`                                  |
| Decisions                | `purchase.afford` · `scenario.project` · `stress.runway` · `goals.plan` · `invest.project`                                                                                |
| Market (T)               | `market.get_reference_rate` · `market.search_credit` · `market.search_deposits` · `market.search_plans` · `market.remittance_quotes` · `fx.rate`                          |
| Detection                | `recurring.detect` · `anomaly.scan`                                                                                                                                       |
| Capture                  | `docs.extract_receipt`* · `docs.extract_document`* · `import.statement`* · `query.run` (bounded DSL)                                                                      |
| Household and protection | `split.settle` · `protection.gaps`                                                                                                                                        |
| R2 actions               | `cards.create_decision_card` · `actions.draft_letter` · `passport.create_link`* · `reminders.schedule` · `cases.track`                                                    |
| Taxes (CO)               | `tax.co.must_file` · `tax.co.cdt_withholding`                                                                                                                             |

`*` = requires explicit user confirmation before persisting or sharing.

## 7. Product metrics shown in the demo

- Time from "my paycheck arrived" to a month plan with receipts (< 10 s).
- Share of figures with a receipt (100 %).
- Annual savings identified for Laura (balance transfer + subscriptions + CDT), **labelled as a
  simulation**.
- p50/p95 latency and cost per conversation by model tier.
- Extraction accuracy for receipts and documents before confirmation.

## 8. Legal notice (base copy, to validate — D-07)

> _FINCH provides information and educational simulations based on the data you provide and on cited
> public sources. It is not personalized financial, investment, legal or tax advice, nor an offer of
> products. FINCH receives no commissions that alter its comparisons and never moves your money.
> Confirm final terms with each institution._

The Spanish (es-CO) version lives with the product copy in the web app's message files.
