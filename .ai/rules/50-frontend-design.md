---
id: finch-frontend-design
title: Premium frontend and design quality (anti-slop)
description: Visual and interaction standards for every FINCH interface on web, desktop and mobile. Load before creating or changing any UI.
always: false
globs:
  - 'apps/web/**'
  - 'apps/admin/**'
  - 'apps/desktop/**'
  - 'apps/mobile/**'
  - 'packages/ui-web/**'
  - 'packages/ui-mobile/**'
  - 'packages/design-tokens/**'
  - 'docs/design/**'
---

# Premium frontend — no AI slop

Read `docs/design/DESIGN-PRINCIPLES.md` before touching UI. FINCH should feel like a **private
bank's instrument panel**: calm, exact, editorial, confident. Not a template.

## Hard requirements

- **Tokens only.** Colors, type, spacing, radii, shadows, motion come from `@finch/design-tokens`.
  No raw hex, px or ms in components.
- **Numbers are the hero.** Tabular figures (`font-variant-numeric: tabular-nums`) for every
  amount; consistent currency formatting per locale; every figure clickable to its receipt.
- **Truth is visible.** Verified / declared / calculated / estimated / stale badges with **text +
  icon**, never color alone.
- **Every state designed**: empty, loading (skeletons shaped like the content), error with a way
  out, offline, stale, partial data, permission denied.
- **Accessible**: WCAG 2.2 AA contrast (enforced by token tests), full keyboard path, visible focus,
  screen-reader labels, reduced-motion respected, touch targets ≥ 44 px.
- **Motion with purpose**: 150–250 ms, standard easing tokens, only to explain change (numbers
  counting to their new value, cards settling), never decorative loops.
- **Copy**: specific, human, bilingual (es-CO / en). No lorem ipsum, no "Welcome to your
  dashboard", no exclamation marks in money contexts.

## Banned (instant review rejection)

- Purple/blue gradient hero, glassmorphism everywhere, neon glows, random 3D blobs.
- Generic emoji as icons; mixed icon families; stock illustrations of people high-fiving.
- Cards-inside-cards-inside-cards; every element with the same radius and shadow.
- Centered-everything layouts; walls of identical KPI tiles; pie charts for more than 3 parts.
- Default component-library look shipped unstyled; placeholder data that looks fake
  ("$1,234.56", "John Doe").
- Dark patterns: fake urgency, hidden costs, pre-checked consent.

## Process

Figma first for new screens (`docs/design/FIGMA.md`), then the `premium-screen` or `ui-component`
skill, then the `design-critique` skill before opening the PR. Screenshots (light + dark, mobile +
desktop widths) go in the PR.
