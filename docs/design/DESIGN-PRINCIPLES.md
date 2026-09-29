# FINCH — design principles

> **Status:** PROPOSED (ADR-0041) — owner: Irene · review: HELL.
> Applies to web, desktop and mobile. Every interface goes through the `design-critique` skill before
> the PR.

## 1. The visual idea

**FINCH is a private bank's instrument panel, made for one person.** Calm, exact, editorial and
self-assured. Nothing that looks like a template, nothing that shouts.

Three words guide every decision: **calm · precision · trust.**

| We want it to feel like…                                             | Not like…                         |
| -------------------------------------------------------------------- | --------------------------------- |
| A well-designed private-banking statement                            | A generic SaaS dashboard          |
| An editorial financial magazine (typography with character)          | A neon crypto app                 |
| A precision instrument (aligned figures, receipts)                   | A chatbot with bubbles and emojis |
| An advisor who speaks plainly and sometimes says "you're doing fine" | A salesperson with fake urgency   |

## 2. Foundations

### 2.1 Color

- **Neutrals do the work; FINCH green carries the meaning.** The brand green (`#0E4331`, `#053F2B`)
  appears in the identity, the primary action and positive states, not as background decoration.
- Slightly greenish neutrals (never pure gray) so everything breathes the brand without saturating
  it.
- **Brass** (muted gold) only for what is **estimated**: a warm, honest signal of "this is a
  projection".
- Semantic colors (positive, negative, warning, info) only for real states.
- First-class dark mode: **same token names, different values**; never invert colors by hand.
- **WCAG 2.2 AA contrast verified by tests** (`packages/design-tokens`), not by intuition.

### 2.2 Typography (proposal to validate in Figma)

| Role             | Family                                     | Use                                                                   |
| ---------------- | ------------------------------------------ | --------------------------------------------------------------------- |
| Display          | **Instrument Serif**                       | Large hero figures, editorial headlines, moments ("your month plan"). |
| UI / text        | **Geist**                                  | The whole interface.                                                  |
| Numbers and data | **Geist Mono** / Geist with `tabular-nums` | Amounts, rates, tables, receipts.                                     |

Both families are distributed under the SIL Open Font License (**VERIFY** license and availability
before pinning them in S0-08). Rules: at most 3 sizes per view, token scale, line length of 45 to 80
characters, **figures always tabular and decimal-aligned**.

### 2.3 Space, shape and depth

- 4 px spacing scale (`space.*` tokens); generous layouts with wide margins.
- Radii with intent: `sm` for controls, `lg` for cards, `pill` only for chips. **Not everything
  equally rounded.**
- Depth through **surface layers** (canvas → default → raised) and subtle borders, not heavy shadows.
  Shadow only for what floats (sheets, menus).
- **Never cards inside cards inside cards.**

### 2.4 Motion

- 150 to 250 ms with the token curves; motion **explains change** (an updating amount counts up to
  its new value, a card settles into its envelope).
- A single "moment" animation per flow (e.g. the paycheck allocation filling the envelopes).
- `prefers-reduced-motion` always respected.

### 2.5 Iconography and illustration

- A single stroke icon family, consistent in weight and size (to decide in ADR-0041: an
  open-licensed candidate with a broad set). Never emojis as icons.
- Own, restrained illustration derived from the logo's bird: wing lines and shapes for empty states
  and key moments. No stock photos or generic people.

### 2.6 Data and charts

- The hero number before the chart. Charts only when they compare or show a trend.
- Bars and lines; **no pies with more than 3 slices**, no 3D.
- Direct labels instead of distant legends; axes formatted in the locale's currency.
- Estimated values are drawn differently (dashed stroke + brass color) and labelled.

## 3. FINCH's own patterns

| Pattern                 | What it communicates                                                                          |
| ----------------------- | --------------------------------------------------------------------------------------------- |
| **Amount with receipt** | Every figure is tappable → receipt panel (formula, version, inputs, source).                  |
| **Truth badge**         | Verified · Declared · Calculated · Estimated · Stale — text + icon.                           |
| **Decision Card**       | What was detected, how much it matters in pesos, assumptions, risks, next step, Ultra review. |
| **Envelope**            | Allocated / spent / available with bar and date; alert at 80 % and 100 %.                     |
| **Card meter**          | Credit utilization, cut-off and payment dates, cost of paying the minimum.                    |
| **Month timeline**      | Income, payments and expiries on the financial calendar.                                      |
| **Second opinion**      | A discreet "Reviewed by Nemotron Ultra" band with findings.                                   |

## 4. Voice and tone

- Clear, human, specific. "If you pay only the minimum, you will pay $87,400 in interest this month"
  instead of "Optimize your finances".
- Honest about uncertainty: "estimated", "according to the source from 28 Sep".
- No exclamation marks in money contexts, no fake urgency, no guilt.
- Bilingual from day 1 (es-CO / en), with the locale's currency and date formats.

## 5. Blacklist (automatic rejection in review)

Purple/blue hero gradient · blanket glassmorphism · neon glows · 3D blobs · emojis as icons · mixed
icon families · stock illustrations · nested cards · everything centered · walls of identical KPIs ·
pies with more than 3 slices · uncustomized component library · fake filler data ("$1,234.56",
"John Doe") · lorem ipsum · dark patterns.

## 6. A verifiable definition of "premium"

A design is ready when:

1. A person understands the most important figure in the view in under 3 seconds.
2. Every state exists (empty, loading, error, offline, stale, estimated).
3. It passes `design-critique` with at least 2/3 on every criterion and 0 blacklist items.
4. It passes axe with no serious issues and token contrast is verified.
5. It looks intentional in light and dark, at 390 px and at 1440 px.
