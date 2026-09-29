# Credits ledger (S0-03)

Balances only — **never keys** (README-DEVELOPERS §13). Updated every Monday. Each founder uses
their own accounts; no extra accounts (00 §8). Keys live only in each founder's local `.env` and,
for the demo, in the host's secret store.

**Reserve ≥ 40 % of the inference credit for judging (1–15 Dec).**

## HELL

| Service                   | Access verified (2026-09-29)                                                | Balance / quota                               | Source                     |
| ------------------------- | --------------------------------------------------------------------------- | --------------------------------------------- | -------------------------- |
| Nebius Token Factory      | ✅ `GET /v1/models` and one completion per tier (FAST, AGENT, DEEP, VISION) | _pending — read in the Token Factory console_ | —                          |
| Nebius AI Cloud (compute) | not used yet                                                                | _pending — needed for S0-06 §3_               | —                          |
| Tavily                    | ✅ `GET /usage`                                                             | Researcher plan: 0 of 1,000 credits used      | Tavily API, 2026-09-29     |
| LangSmith                 | ✅ `GET /api/v1/sessions` (Personal Access Token, "Workspace 1")            | _pending — read in Settings → Billing_        | —                          |
| Toloka                    | ⚠️ key stored, not verified: `api.toloka.ai` timed out from this machine    | USD 50.00                                     | Toloka console, 2026-09-28 |
| Tendem by Toloka          | ✅ MCP `initialize` on `https://mcp.tendem.ai/mcp` (server `tendem-mcp`)    | _pending — read at agent.tendem.ai_           | —                          |

Notes:

- README-DEVELOPERS §13 lists 4,125 Tavily Builders add-on credits for HELL; the `/usage` endpoint
  reports only the 1,000-credit plan. Confirm in the Tavily dashboard whether the add-on is applied.
- README-DEVELOPERS §13 lists USD 100 each for LangSmith and Toloka (Builders); the Toloka console
  shows USD 50.00. Confirm with the Builders program.
- Tendem tasks spend real balance per task; any integration needs a per-task price cap.

## Nairy

| Service              | Access verified | Balance / quota | Source |
| -------------------- | --------------- | --------------- | ------ |
| Nebius Token Factory | _pending_       | _pending_       | —      |
| Tavily               | _pending_       | _pending_       | —      |
