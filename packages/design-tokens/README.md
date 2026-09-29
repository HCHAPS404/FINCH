# @finch/design-tokens

Semantic design tokens shared by web, desktop and mobile. Constitution §34–§35, ADR-0041,
`docs/design/DESIGN-PRINCIPLES.md`.

> **Status:** implemented — DTCG JSON sources, alias resolution, CSS output and WCAG 2.2 AA
> contrast tests.

## Responsibility

Hold every visual value (color, type, space, radius, motion, sizes) once, in the W3C Design Tokens
(DTCG) format that Figma Variables mirror (`docs/design/FIGMA.md`), and render it for each platform.

## Owns

- `src/tokens/primitives.json` — raw values (brand greens sampled from the logo, neutrals, semantic
  hues, type, space, radius, motion, sizes). Raw values live **only** here.
- `src/tokens/semantic.light.json` · `semantic.dark.json` — semantic names (surface, text, border,
  action, feedback, truth) as **aliases only**; same names in both themes.
- `renderCss()` → `dist/finch-tokens.css` (`@finch/design-tokens/css`): light by default, dark via
  `prefers-color-scheme` and `[data-theme='dark']`.
- `themes`, `color()`, `contrastRatio()` for typed access and tests.

## Does not own

- Component implementations (`@finch/ui-web`, `@finch/ui-mobile`).

## Invariants (enforced by `src/index.test.ts`)

- Light and dark define exactly the same names.
- Semantic layers contain only aliases; every alias resolves to a primitive.
- Every text token on every surface ≥ 4.5:1; focus ring and strong border ≥ 3:1; every
  foreground/background pair (actions, feedback, truth classes) ≥ 4.5:1 — in both themes.
- Financial state is never conveyed by color alone (components add text + icon).

## Changing a token

1. Edit the JSON (primitive value, or a semantic alias).
2. `pnpm --filter @finch/design-tokens test` — contrast must stay AA.
3. Mirror the change in Figma Variables in the same design review.
4. `pnpm --filter @finch/design-tokens build` regenerates the CSS.
