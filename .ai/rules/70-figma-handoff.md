---
id: finch-figma-handoff
title: Figma design handoff
description: How designs flow from Figma into tokens and components, and how agents read Figma via MCP.
always: false
globs:
  - 'packages/design-tokens/**'
  - 'packages/ui-web/**'
  - 'packages/ui-mobile/**'
  - 'docs/design/**'
---

# Figma handoff

Reference: `docs/design/FIGMA.md`.

- Figma is the design source for **layout, components and flows**; `packages/design-tokens`
  (DTCG JSON) is the source for **token values** in code. Figma Variables mirror the same names
  (`color/surface/default`, `space/4`, …). A token changes in both, in the same PR/design review.
- Agents read designs through the **Figma MCP server** (configured in `.mcp.json` /
  `.cursor/mcp.json`). Use the frame link the human gives you; never guess from a screenshot when a
  frame is available.
- Map Figma components to code with the same name and variant properties; record the mapping
  (Code Connect or `docs/design/component-map.md`).
- Never copy raw values from Figma inspect into code — resolve them to tokens. If a value has no
  token, stop and ask: either the design is off-system or a token is missing.
- Every screen in code references its Figma frame URL in the PR description.
