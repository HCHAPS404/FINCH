# Future work — jurisdiction expansion

> **Status: planned, not started.** Captured so the scope is not lost; do not implement until
> scheduled on its own branch.

## Goal

Extend `jurisdictions/` beyond Colombia (README §36) without touching the global core.

| Region  | Jurisdictions                                                                                                 |
| ------- | ------------------------------------------------------------------------------------------------------------- |
| America | `US` (federal) + one sub-pack per state (`US/<state>`, 50 states + DC)                                        |
| Europe  | `ES` Spain · `DE` Germany · `FR` France · `IT` Italy · `PT` Portugal · `NL` Netherlands · `GB` United Kingdom |
| Asia    | `CN` China · `JP` Japan · `KR` South Korea                                                                    |

## What each pack contains

- `jurisdiction.json` — locale, IANA timezone(s), ISO 4217 currency.
- `sources.json` — allowlist of **official** domains (regulator, central bank, tax authority)
  with purpose and owner, as required by the `market-truth-source` skill.
- `README.md` — the facts FINCH needs for that jurisdiction (usury/interest caps, reference
  rates, tax thresholds, holidays, required disclosures) and their expected cadence.
- `US/<state>/` — each state's banking/financial regulator domain and its usury rules, since
  interest caps are set per state.

## Where the values come from

Legal and tax values are **never hardcoded**. They are fetched at runtime through the Market
Truth flow: Tavily Search/Extract over the allowlisted domains → deterministic parser with
fixtures → stored with provenance (URL + retrieval time + hash) and freshness → `STALE` fallback,
never a guess. Adapter work belongs to `feat/s2-market-truth-tavily`.

## Related decisions

- D-11 (`docs/hackathon/07-risks-and-decisions.md`) picks the single second country for the
  hackathon (G4). This document covers the broader post-hackathon expansion.
