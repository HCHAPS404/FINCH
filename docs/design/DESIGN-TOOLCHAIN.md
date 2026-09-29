# Design and front-end tools

> **Status:** PROPOSED (ADR-0041). Every new tool that enters the repository as a dependency is
> verified in its official registry and pinned to an exact version (AGENTS.md §7).

| Need                              | Tool                                                         | Role                                                            | Cost / plan                                | Status                                       |
| --------------------------------- | ------------------------------------------------------------ | --------------------------------------------------------------- | ------------------------------------------ | -------------------------------------------- |
| UI design, components, prototypes | **Figma**                                                    | Source of truth for layout, components, flows                   | Team plan (VERIFY Dev Mode / Code Connect) | Adopted                                      |
| Flows, workshops, user maps       | **FigJam**                                                   | High-level flows and product sessions                           | Included with Figma                        | Adopted                                      |
| Agents reading designs            | **Figma MCP** (`https://mcp.figma.com/mcp`)                  | Claude, Cursor, Codex and Antigravity read real frames          | Per Figma plan                             | Configured (`.mcp.json`, `.cursor/mcp.json`) |
| Tokens                            | **DTCG JSON** in `packages/design-tokens` + Variables plugin | Values in code with contrast tests; mirrored in Figma Variables | Free (plugin to VERIFY)                    | Implemented (code)                           |
| Component workbench               | **Storybook**                                                | Every variant and state of `packages/ui-web`, light/dark        | Open source                                | S0-08                                        |
| Visual regression                 | **Playwright** (screenshots)                                 | Per-component and per-screen snapshots in CI                    | Open source                                | S0-08 / S1                                   |
| Accessibility                     | **axe-core** (via Playwright)                                | 0 serious issues per screen                                     | Open source                                | S1                                           |
| Performance                       | **Lighthouse CI**                                            | Budgets ≥ 90 performance / accessibility                        | Open source                                | S2                                           |
| Brand animation                   | **Rive** (interactive) or **Lottie**                         | 2–3 moments: paycheck allocation, goal reached, empty state     | Free plan (VERIFY runtime license)         | S2 (decision in ADR-0041)                    |
| Icons                             | One open-licensed stroke set                                 | Consistency; never emojis                                       | Free                                       | Decision in S0-08                            |
| Typography                        | Instrument Serif + Geist + Geist Mono                        | Editorial character + data legibility                           | OFL (VERIFY)                               | Proposed                                     |
| Charts                            | SVG-based React chart library                                | Bars, lines, dashed estimated series                            | Open source                                | Decision in S1 (ADR)                         |

**Rule:** no tool that duplicates another in this table is added without an ADR.
