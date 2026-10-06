# @finch/design-tokens

Semantic design tokens shared by web, mobile and desktop. README §34.

## Responsibility

The single source of color, typography and spacing tokens consumed by `@finch/ui-web`
and `@finch/ui-mobile` — never hand-picked again per component.

## Owns

- Semantic color tokens: `surface`, `text`, `border`, `positive`, `negative`,
  `warning`, `critical`, `verified`, `estimated`, `stale`, `pending` — each as a
  light/dark pair (`src/colors.ts`).
- The type scale actually used by the built Figma component set (`src/typography.ts`).
- Spacing and corner-radius scales actually used by the built Figma component set
  (`src/spacing.ts`).

## Does not own

- Component implementations — those are `@finch/ui-web` and `@finch/ui-mobile`.
- The non-color signal (icon, label, shape) that must accompany a status token so
  financial state is never conveyed by color alone (§34, §35) — that pairing is a
  component concern. This package only guarantees the color half is contrast-safe;
  it cannot guarantee a consumer renders the accompanying signal.

## Invariants

- Financial state is never conveyed by colour alone; verified/estimated/stale need a
  non-colour signal too (§34, §35) — enforced at the component layer, not here.
- Every token pair meets contrast requirements in both themes (§35) — enforced here,
  mechanically, by `src/colors.test.ts`: WCAG 4.5:1 for every surface/text pair and
  every status token's bg/fg pair. `border.default` and `border.subtle` are decorative
  dividers (Figma: card/sidebar hairlines) and are not held to a contrast minimum;
  `border.strong` is the only tier Figma uses as an interactive-component boundary (the
  unchecked Checkbox) and is held to WCAG 1.4.11's 3:1. This is the test that makes the
  invariant real rather than aspirational — note what it actually covers before
  assuming every token is contrast-safe in every use.
- Light values are traceable to an actual Figma fill/stroke; none are invented. Dark
  values not yet covered by a Figma dark-mode pass are derived algorithmically
  (hue/saturation held constant, lightness searched until contrast clears) and are
  explicitly marked provisional in `src/colors.ts` — see that file's header comment
  before trusting a dark value as a final design decision.

## Failure modes

Pure data module: there is nothing to fail at runtime. The only failure mode is a
token value silently drifting from what Figma actually specifies, which is why
`src/colors.ts` documents the exact source (file key, page, extraction date) for every
value instead of just asserting correctness.

## Observability

None. This package emits no logs, traces or metrics.

## Tests

`src/colors.test.ts` — contrast-ratio proof for every surface/text pair, every border,
and every status token's bg/fg pair, in both themes, computed from the real exported
hex values (not hand-verified). Also asserts the light and dark palettes declare the
same semantic keys, so a theme can never silently fall behind the other.

## Unblocked by

FIN-015
