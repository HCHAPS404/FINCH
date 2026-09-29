# FINCH in Figma — design channel, structure and handoff

> **Status:** PROPOSED (ADR-0041) · file owner: Nairy · technical editor: HELL.

Figma is the source of truth for **layout, components, flows and prototypes**.
`packages/design-tokens` (JSON in DTCG format) is the source of truth for **token values** in code.
Both use exactly the same names.

## 1. Connecting the agents to Figma (MCP)

Agents read designs through **Figma's official MCP server**. The remote server is
`https://mcp.figma.com/mcp`; there is also a desktop server at `http://127.0.0.1:3845/mcp` that only
works while the Figma desktop app is open.

| Tool            | Configuration in the repo                 | Manual step for each founder                                                                                                         |
| --------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| **Claude Code** | `.mcp.json` (server `figma`, type `http`) | Accept the project server and sign in to Figma (OAuth). Official alternative: `claude plugin install figma@claude-plugins-official`. |
| **Cursor**      | `.cursor/mcp.json`                        | Enable the server in _Settings → MCP_ and sign in.                                                                                   |
| **Codex**       | — (user configuration)                    | Add Figma's remote server to Codex's MCP configuration (**VERIFY** the current steps in the Codex documentation).                    |
| **Antigravity** | — (user configuration)                    | Add the remote server from its MCP manager (**VERIFY** in its documentation).                                                        |

Usage: the human shares the frame link and the agent uses the `figma-to-code` skill. **Never implement
from a screenshot when the frame exists.**

## 2. Structure of the "FINCH — Product Design" file

| Page               | Contents                                                                                                                                                  |
| ------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `00 · Cover`       | Cover, file status, links to the repo and the catalog.                                                                                                    |
| `01 · Foundations` | Colors (Variables collections), typography, spacing, radii, elevation, motion, icons, illustration.                                                       |
| `02 · Components`  | Library: primitives → components → FINCH patterns (Amount with receipt, Truth badge, Decision Card, Envelope, Card meter…), with every variant and state. |
| `03 · Flows`       | **Linear working structure**: one flow per catalog feature, with numbered frames (`B1-01`, `B1-02`…) left to right with connectors.                       |
| `04 · Web`         | Web screens (1440 / 1024 / 390) per destination: Today, Money, FINCH, Opportunities, Me.                                                                  |
| `05 · Desktop`     | Windows/macOS adaptations (window, menus, shortcuts).                                                                                                     |
| `06 · Mobile`      | Android / iOS (safe areas, bottom tabs, gestures).                                                                                                        |
| `07 · Prototypes`  | Clickable prototypes of the star flows (Payday, Can I afford it?, Opportunity).                                                                           |
| `08 · Handoff`     | "Ready for dev" frames with links to issues and PRs.                                                                                                      |
| `99 · Sandbox`     | Free exploration (never implemented from here).                                                                                                           |

## 3. Variables (tokens) in Figma

| Collection   | Modes                      | Contents                                                                                                                           | Mirror in code                              |
| ------------ | -------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------- |
| `primitives` | —                          | Color scales, typography, spacing, radius, motion                                                                                  | `src/tokens/primitives.json`                |
| `semantic`   | `light`, `dark`            | `color/surface/*`, `color/text/*`, `color/border/*`, `color/action/*`, `color/feedback/*`, `color/truth/*` (aliases of primitives) | `semantic.light.json`, `semantic.dark.json` |
| `platform`   | `web`, `desktop`, `mobile` | Touch sizes, density, per-platform radii                                                                                           | (added when needed)                         |

- Identical names: `color/text/primary` in Figma = `color.text.primary` in the JSON =
  `--finch-color-text-primary` in CSS.
- **Sync flow:** value changes are made in the repo's JSON (with a PR and contrast tests) and
  imported into Figma Variables with a DTCG-compatible plugin. Figma's Variables REST API is limited
  to certain plans (**VERIFY** plan and plugin in S0-08). A new token is created on both sides in the
  same review.

## 4. Components

- Same name in Figma and in code (`Amount`, `TruthBadge`, `DecisionCard`…).
- Variant properties = component props (`variant`, `size`, `tone`, `state`).
- Auto layout everywhere; no absolute positioning except overlays.
- Every component documents its states: default, hover, pressed, focus, disabled, loading, error, and
  the data states (empty, estimated, stale).
- The Figma → code mapping is recorded in [`component-map.md`](component-map.md) (and with Code
  Connect once enabled; **VERIFY** the required plan).

## 5. Linear flows (page `03 · Flows`)

Each catalog flow has its own row:

```text
[B1-01 Today] → [B1-02 "My paycheck arrived"] → [B1-03 Confirm amount] → [B1-04 Month plan]
   → [B1-05 Adjust envelopes] → [B1-06 Execution checklist] → [B1-07 Completed state]
         ↘ [B1-E1 Error: unreadable amount]   ↘ [B1-E2 Deficit detected]
```

Rules: numbered frames, the happy path on the top row, errors and branches below, every frame named
after its catalog feature and state.

## 6. Handoff (definition of "Ready for dev")

- [ ] Every state designed (empty, loading, error, offline, stale, estimated).
- [ ] Only library Variables and components (0 loose values).
- [ ] Final copy in ES and EN (or message keys).
- [ ] Interaction and motion annotations.
- [ ] 390 / 1440 versions (web) and the target platform's.
- [ ] Reviewed with `design-critique`.
- [ ] Frame marked _Ready for dev_ and linked to the issue.

## 7. Other design tools

See [`DESIGN-TOOLCHAIN.md`](DESIGN-TOOLCHAIN.md): FigJam (flows and workshops), Storybook (component
workbench), Rive or Lottie (brand animation), visual capture with Playwright.
