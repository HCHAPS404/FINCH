# ADR-0038: Hackathon demo deployment topology

- **Status:** Proposed. Becomes Accepted with option A or B after task S0-06 (deadline 2026-10-02).
- **Date:** 2026-09-28
- **Deciders:** HELL, Irene
- **Supersedes:** none. A **scoped exception** to ADR-0012 (AWS primary) and ADR-0013 (compute
  strategy) for the hackathon demo environment only.

## Context

The demo must be publicly reachable and working from submission (2026-10-29) until the end of
judging (2026-12-15), at minimal cost, for a two-person team. Standing up the AWS topology of
README §41 (accounts, network, OIDC, IaC) would consume the whole build window.

The hackathon rewards use of Nebius AI Cloud: Serverless Jobs and Serverless Endpoints are
"encouraged". "Runs on Nebius" is satisfied either by runtime calls to Token Factory or by running
on Nebius AI Cloud compute.

## Decision

The demo environment is a single, isolated `hackathon` environment:

- **Option A (preferred):** web and API on Nebius AI Cloud (a Serverless Endpoint running an HTTP
  container, or a small VM); PostgreSQL with pgvector on Nebius; the watcher on **Nebius
  Serverless Jobs**; inference on Token Factory.
- **Option B (fallback):** web, API and PostgreSQL on a managed PaaS (Railway, Render or Fly.io,
  plus Neon or Supabase); the watcher still on Nebius Serverless Jobs if verified, otherwise a
  GitHub Actions schedule; inference on Token Factory.

Choose A only if the following are all verified:

- the endpoint accepts a generic HTTP container;
- Jobs can be scheduled (natively or via CLI trigger);
- the cost through 2026-12-15 fits the available AI Cloud credits plus decision D-08;
- the environment can stay continuously available.

Otherwise choose B.

Constraints either way:

- secrets only in the host's secret store;
- deploys only from CI;
- the demo deploys from tag `v0.1.0-hackathon` after submission;
- no production data.

Production cloud remains AWS per ADR-0012 until a new ADR, informed by real cost and operations
data gathered in Q1 2027, says otherwise.

## Alternatives considered

- **Full AWS per README §41.** Rejected for the time budget.
- **Vercel or Cloudflare for everything.** Viable for the web only. The API and the persistent
  watcher fit the monolith better on a container host.

## Consequences

### Positive

- Fast to stand up, cheap, and adds visible use of Nebius Serverless.

### Negative

- A second deployment target to maintain until the demo is retired.

### Neutral / accepted trade-offs

- IaC for the demo is minimal: CLI scripts in `infra/hackathon/`, documented.

## Security impact

One public ingress. Rate limiting, CORS, security headers, upload limits and a credit kill switch
are required before the URL is shared.

## Privacy impact

Synthetic personas plus opt-in private workspaces. Uploads are auto-deleted after 7 days.

## Cost

To be recorded after S0-06, including hosting through 2026-12-15.

## Migration

The demo is retired or migrated after 2026-12-15, when the production topology is decided.

## Rollback

Switch from A to B by redeploying the same containers. The data store can be re-seeded.

## References

- ADR-0012, ADR-0013, ADR-0035
- `docs/hackathon/03-architecture-and-nebius-stack.md` §3
