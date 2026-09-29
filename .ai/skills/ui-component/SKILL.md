---
name: ui-component
description: Create or change a design-system component in packages/ui-web (or ui-mobile) with token-driven styling, variants mirroring Figma, full state coverage, accessibility, stories and tests. Use for any reusable UI element.
---

# Skill: design-system component

1. **Name and API from Figma**: same component name; props mirror Figma variant properties
   (`variant`, `size`, `tone`, `state`). Record the mapping in `docs/design/component-map.md`.
2. **Layer**: `primitives/` (Box, Text, Stack, Icon), `components/` (Button, Amount, Badge,
   Sheet, Card, Field…), `patterns/` (DecisionCard, ReceiptPanel, EnvelopeRow, CardUsageMeter…).
3. **Styling**: only tokens (CSS variables from `@finch/design-tokens`). No raw hex/px/ms. Variants
   via a typed variant map, not ad-hoc class strings.
4. **Accessibility**: correct role/semantics first (use native elements), keyboard interactions,
   focus-visible ring token, `aria-*` where needed, 44 px min touch target, reduced motion.
5. **States**: default, hover, active, focus-visible, disabled, loading, error, and data states
   (empty/estimated/stale) where relevant.
6. **Story** for every variant × state (Storybook) including dark theme and RTL-safe layout check.
7. **Tests**: interaction test (Testing Library), axe check, visual snapshot light/dark.
8. **Docs**: short usage + do/don't in the component's `README.md`.

## Done when

Story renders all variants in both themes, axe clean, tests green, mapping recorded, zero raw values
(lint).
