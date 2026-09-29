# ADR-0041: Design system, Figma channel and front-end toolchain

- **Status:** Proposed
- **Date:** 2026-09-28
- **Deciders:** HELL, Irene
- **Supersedes:** none. Refines Constitution §34–§35 and ADR-0004/0005/0006 for the delivery order.

## Context

FINCH must look and feel premium and trustworthy on web, then Windows, then Android, then macOS
and iOS (founders' decision 2026-09-28). The founders want an interface that avoids generic
"AI slop" and a direct design channel with Figma, so that both humans and coding agents (Claude,
Cursor, Codex, Antigravity) work from the same designs and values.

## Decision

1. **Tokens as code.** `packages/design-tokens` holds W3C DTCG JSON (primitives + semantic light/dark)
   and renders CSS variables and typed maps. Tests enforce: semantic layers are aliases only, every
   alias resolves, and every text/surface and foreground/background pair meets WCAG 2.2 AA in both
   themes.
2. **Figma** is the source for layout, components, flows and prototypes, with the file structure
   and handoff checklist of `docs/design/FIGMA.md`. Figma Variables mirror the token names.
3. **Agents read Figma through the official Figma MCP server** (`https://mcp.figma.com/mcp`),
   configured for Claude Code (`.mcp.json`) and Cursor (`.cursor/mcp.json`); Codex and Antigravity
   are configured per user.
4. **Design principles and an explicit anti-slop list** (`docs/design/DESIGN-PRINCIPLES.md`) are
   enforced by the `finch-frontend-design` rule and the `design-critique` skill before every UI PR.
5. **Toolchain** per `docs/design/DESIGN-TOOLCHAIN.md`: Storybook, Playwright visual snapshots,
   axe, Lighthouse CI; Rive or Lottie for 2–3 brand moments; one open-licensed icon set;
   typography proposal Instrument Serif + Geist + Geist Mono (licenses to verify).
6. **Front architecture** per `docs/design/FRONTEND-ARCHITECTURE.md`; delivery order web → Windows →
   Android → macOS + iOS.
7. **Agent context system**: rules and skills live once in `.ai/` and are generated into each tool's
   format by `scripts/ai-sync.mjs`; CI fails on drift (`pnpm ai:check`).

## Alternatives considered

- **A component library used as-is.** Fast, but produces the generic look the founders explicitly
  reject; kept only as unstyled accessible primitives if adopted later (decision in S0-08).
- **Figma as the source of token values** (export-only pipeline). Rejected: values would bypass the
  contrast tests and code review; Figma mirrors the repo instead.
- **Per-tool rule files written by hand.** Rejected: four copies drift within days.

## Consequences

### Positive

- One visual language across platforms, verifiable accessibility, and agents that implement from
  real designs.

### Negative

- Keeping Figma Variables and JSON in sync needs discipline (a token change touches both).

### Neutral / accepted trade-offs

- Some tool paths (Antigravity directories, Codex MCP setup, Figma plan features) are marked VERIFY.

## Security impact

The Figma MCP connection uses each founder's OAuth session; no Figma tokens are stored in the repo.
Front-end hardening is defined in the `finch-security-privacy` rule.

## Privacy impact

Designs and fixtures use synthetic data only.

## Cost

Figma team plan (existing). Other tools are open source or free tiers; Rive/Lottie and icon set
licenses to be verified before adoption.

## Migration

Existing hand-written Cursor rules are replaced by generated ones from `.ai/`.

## Rollback

Tokens and rules are plain files; reverting the ADR's commits restores the previous state.

## References

- `docs/design/*`, `packages/design-tokens`, `.ai/`, `scripts/ai-sync.mjs`
- Figma MCP server: https://help.figma.com/hc/en-us/articles/32132100833559-Guide-to-the-Figma-MCP-server
- W3C Design Tokens Community Group format
