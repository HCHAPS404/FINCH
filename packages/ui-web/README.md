# @finch/ui-web

React component library for apps/web and apps/desktop. README §34.

## Responsibility

The complete set of React components that exist in the FINCH Figma file's
"02 · Components" page (file key `aA7KzO0a2hg4cJY3zhDzkS`), built on
`@finch/design-tokens`, so `apps/web` and `apps/desktop` consume one real
implementation instead of two divergent hand-rolled ones.

## Owns

- Shared web components built on `@finch/design-tokens`: `Button`, `Input`,
  `Checkbox`, `Toggle`, `TruthBadge`, `StatusChip`, `Banner`, `FreshnessStamp`,
  `EnvelopeRow`, `Logo`, `NavItem`, `TabItem`, `Sidebar`, `TopBar`, `MobileHeader`,
  `MobileTabBar`.
- The 45-icon set (`src/icons/`), vector-exact exports from Figma's Images API, not
  hand-traced.
- `theme.css` — CSS custom properties mirroring `@finch/design-tokens`' `light`/`dark`
  palettes, needed because inline style objects cannot express `:hover`,
  `:focus-visible` or `prefers-color-scheme`, and this package adds no CSS-in-JS
  dependency. `src/theme.test.ts` proves it has not drifted from the token source.

## Does not own

- Business logic — components render, they do not decide (§57).
- Data fetching policy; that is the application's concern.
- Routing — `NavItem`/`TabItem` render a plain `<a>` and accept `href`/`onClick`; which
  router owns navigation (Next.js, Tauri) is decided by the consuming app.
- The shared token vocabulary itself (`surface`/`text`/`border`/`positive`/… ) — that
  is `@finch/design-tokens`. Where a Figma component uses a color outside that
  11-token vocabulary (`TruthBadge`'s "Calculated" kind, `StatusChip`'s "Accent" tone),
  it is kept local to the component file, documented inline, and not promoted to a
  shared token on this package's say-so.

## Invariants

- Every financial chart has an equivalent accessible textual representation (§35) —
  `EnvelopeRow`'s progress bar carries `role="progressbar"` with
  `aria-valuenow`/`aria-label`, not just a colored div.
- Stale and estimated values are visually distinguishable from verified ones (§116) —
  enforced by `TruthBadge` taking the real `TruthClass` union from `@finch/contracts`
  (not a free-form string) and rendering a distinct label per class, never color alone
  (`TruthBadge.test.tsx` asserts every class gets its own text).

## Failure modes

Pure presentation components: no network calls, no thrown business errors. The one
real failure mode is a typo'd CSS module class name — `cls()` (`src/internal/cx.ts`)
throws immediately rather than silently rendering `undefined` into the DOM.

## Observability

None. This package emits no logs, traces or metrics.

## Tests

- `src/colors` invariant is proven one layer down, in `@finch/design-tokens`; this
  package's `theme.test.ts` proves its own CSS mirror has not drifted from it.
- `src/TruthBadge/TruthBadge.test.tsx` — every `TruthClass` renders a distinct,
  non-empty label.
- `src/primitives.test.tsx` — smoke coverage for `Button` (disabled blocks the click
  handler), `Input` (label association, accessible error), `Checkbox`/`Toggle`
  (accessible role, togglable), `StatusChip`/`Banner`/`FreshnessStamp` (text content,
  not just color).

## Unblocked by

FIN-012
