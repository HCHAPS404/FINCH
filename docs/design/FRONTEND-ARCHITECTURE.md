# Front-end architecture (web → Windows → Android → macOS/iOS)

> **Status:** PROPOSED (ADR-0041) · owners: Nairy (UI) and HELL (integration and platforms).
> Complements [`SOFTWARE-ARCHITECTURE.md`](../architecture/SOFTWARE-ARCHITECTURE.md) §8.

## 1. Shared layers

```text
packages/design-tokens   values (DTCG) → CSS variables · TS maps · Figma Variables   ✅ implemented
packages/ui-web          primitives → components → patterns (React, web + desktop)   S0-08
packages/ui-mobile       same names and props with native primitives (Expo)          Android (phase 3)
packages/api-client      client generated from OpenAPI (the only path to the API)    S1
packages/contracts       types, truth classes, errors                                ✅ existing
```

No client computes money or holds secrets. Every figure arrives from the server with its receipt.

## 2. `apps/web` (Next.js, PWA) — structure

```text
apps/web/
  src/
    app/
      (marketing)/            landing, persona picker, legal
      (app)/                  authenticated shell with the 5 destinations
        today/  money/  finch/  opportunities/  me/
      api/                    minimal BFF routes only (never business logic)
      layout.tsx  globals.css (imports @finch/design-tokens/css)
    features/<feature>/       per catalog feature: components/ hooks/ copy/ tests/
    lib/                      api (client + TanStack Query), i18n, formatting, telemetry
    messages/                 es-CO.json, en.json
  e2e/                        Playwright: flows + axe + screenshots
  public/                     manifest, logo icons, service worker
```

Conventions:

- **Server components** to load data; client components only for interaction.
- **TanStack Query** for refreshing; **React Hook Form + zod** for forms.
- English routes (`/money/envelopes`); copy by message key.
- `<Amount>`, `<Rate>`, `<ReceiptTrigger>`, `<TruthBadge>` for every number.
- A single layout container with a maximum width (`size.contentMax`) and a 12-column grid on
  desktop, 4 on mobile.

## 3. `packages/ui-web` — structure

```text
packages/ui-web/src/
  primitives/   Box, Stack, Grid, Text, Heading, Icon, VisuallyHidden, FocusRing
  components/   Button, IconButton, Field, Select, Switch, Tabs, Sheet, Dialog, Toast, Tooltip,
                Card, Badge, Amount, Rate, Meter, Skeleton, EmptyState, ErrorState
  patterns/     ReceiptPanel, TruthBadge, DecisionCard, EnvelopeRow, CardUsageMeter,
                MonthTimeline, PaydayPlan, SecondOpinionBanner, FreshnessStamp
  motion/       transition presets from tokens; NumberTransition
  styles/       reset, layers, minimal utilities (no loose values)
```

Every component has: `Component.tsx` · `Component.stories.tsx` · `Component.test.tsx` ·
`README.md` (usage and do/don't).

## 4. Platforms (delivery order)

| Phase | Platform        | App                      | Strategy                                                                                             |
| ----- | --------------- | ------------------------ | ---------------------------------------------------------------------------------------------------- |
| 1     | **Web**         | `apps/web`               | Everything is proven here first; it is the hackathon demo.                                           |
| 2     | **Windows**     | `apps/desktop` (Tauri 2) | Reuses `packages/ui-web`; adds window, menus, shortcuts, native notifications, drag-and-drop import. |
| 3     | **Android**     | `apps/mobile` (Expo)     | Rebuilds screens with `packages/ui-mobile` (same tokens and props); camera, biometrics, push.        |
| 4     | **macOS + iOS** | Same apps                | Build, signing and platform adjustments (macOS menu, iOS safe areas and gestures).                   |

## 5. Front-end hardening

- Strict CSP, security headers, `httpOnly`/`Secure`/`SameSite` cookies, no tokens in `localStorage`
  (rule `40-security-privacy`).
- zod validation on the client for UX **and** on the server as the authority.
- No sensitive data in URLs, browser logs or analytics.
- Tauri: minimal capabilities; Expo: SecureStore, biometric gate, push without sensitive data.
- Performance and accessibility budgets in CI (Lighthouse, axe) and visual regression.
- Lint: ban loose color/spacing values in components (ESLint rule to add in S0-08 alongside
  `no-float-money`).
