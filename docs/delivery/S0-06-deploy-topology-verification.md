# S0-06 — Demo deployment topology: verification record (ADR-0038)

- **Date:** 2026-09-29 · **Owner:** HELL · **Decides:** ADR-0038 (topology) and D-13 / ADR-0039 (email)
- **Method:** Nebius official documentation (docs.nebius.com), consulted through search results.
  The pages could not be opened directly from the build environment (egress blocked), so every
  item below is marked either **Verified (docs)** or **Open** with the exact check a founder must do
  in the Nebius console. Nothing here is taken from memory.

## 1. ADR-0038 conditions for Topology A

| #   | Condition (ADR-0038)                                | Finding                                                                                                                                                                                                                                                                                                                                                                         | Status                                                                                                                   |
| --- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| 1   | The endpoint accepts a generic HTTP container       | Serverless AI endpoints run "containers over virtual machines (VMs) in Compute" with any image path, container ports, entrypoint and environment variables. The official quickstart deploys `nginx:alpine` on `--platform cpu-d3 --preset 4vcpu-16gb --public --container-port 80 --auth token`; the changelog adds a `2vcpu-8gb` preset for `cpu-d3` (non-GPU AMD EPYC Genoa). | **Verified (docs)** — CPU-only HTTP containers are supported.                                                            |
| 1b  | The web app can be public without a bearer token    | The quickstart pairs `--public` with `--auth token`. Whether an endpoint can be public with **no** token (needed for a browser-facing PWA) is not stated in the results.                                                                                                                                                                                                        | **Open** — in the console, create a test endpoint with `--public` and no auth; if refused, put the web on Topology B.    |
| 2   | Jobs can be scheduled (natively or via CLI trigger) | Jobs "run container images as one-off or scheduled batch workloads" and are billed only while running. The documented flags of `nebius ai job create` include `--image --env --env-secret --platform --preset --timeout --restart-policy --preemptible …` but **no `--schedule` flag**.                                                                                         | **Verified (docs)** — no native cron flag; trigger by CLI from a GitHub Actions `schedule` (ADR-0038 already allows it). |
| 3   | Cost through 2026-12-15 fits the AI Cloud credits   | Billing is per VM running time. An always-on endpoint from 2026-10-29 to 2026-12-15 is ~48 days ≈ **1,152 hours**; the watcher job adds only its run minutes. The per-hour price of `cpu-d3 2vcpu-8gb` was not in the results.                                                                                                                                                  | **Open** — read the hourly price in the console / pricing page and the AI Cloud credit balance (S0-03), then fill §3.    |
| 4   | The environment stays continuously available        | An endpoint is a container on a running VM; it stays up while the VM runs (no scale-to-zero was stated).                                                                                                                                                                                                                                                                        | **Verified (docs)**, subject to #3 (cost of staying up).                                                                 |

## 2. Recommendation

**Hybrid, as ADR-0038 already permits:**

- **Watcher → Nebius Serverless Jobs (Topology A part), always.** It costs only run minutes and is
  what makes FINCH "run on Nebius AI Cloud compute" for the Personal AI track. Trigger: a GitHub
  Actions `schedule` workflow runs `nebius ai job create` with a least-privilege service account whose
  credential lives only in GitHub Actions secrets; the job is idempotent on `workspace_id + date`
  (Constitution §4.12–13).
- **Inference → Token Factory** (mandatory, unchanged).
- **Web + API + PostgreSQL:**
  - **Topology A** (Nebius endpoint `cpu-d3 2vcpu-8gb` + PostgreSQL on Nebius) **if** check 1b
    passes **and** `1,152 h × hourly price (endpoint + database)` ≤ **50 %** of the AI Cloud credit
    left after S0-03 (the other half is reserved for the watcher, re-deploys and the P7 private
    inference option);
  - otherwise **Topology B** (managed PaaS + managed PostgreSQL), keeping the watcher on Nebius.

## 3. Numbers the founders must fill in (then ADR-0038 moves to Accepted)

| Item                                         | Value | Source (console page, date) |
| -------------------------------------------- | ----- | --------------------------- |
| AI Cloud credit available after S0-03        |       |                             |
| `cpu-d3 2vcpu-8gb` price per hour            |       |                             |
| Managed PostgreSQL on Nebius, price per hour |       |                             |
| Endpoint + DB × 1,152 h                      |       |                             |
| Check 1b (public endpoint without token)     |       |                             |
| **Decision (A or B for web/API/DB)**         |       |                             |

## 4. Email provider (D-13, ADR-0039)

Hackathon scope needs inbound (forwarded receipts and notifications, E1/E4) and outbound (briefing).
No provider price or feature was verifiable from this environment, so no provider is chosen here.
Selection criteria, in order, to apply when a founder compares candidates on their official pages:

1. Inbound parsing to a webhook on a custom domain (hard requirement).
2. Webhook signature verification and TLS (security, ADR-0039 rule 3).
3. Free or lowest tier covering the demo volume through 2026-12-15.
4. Data region and retention settings compatible with minimal-PII messages (ADR-0039 rule 4).
5. An SDK or plain HTTPS API usable from an adapter behind `ChannelPort` (no SDK in the domain).

Record the choice, its price and its source in D-13 and in ADR-0039 §Cost.

## 5. Constraints kept regardless of the choice (ADR-0038)

Secrets only in the host's secret store · deploys only from CI · the demo deploys from tag
`v0.1.0-hackathon` · synthetic data only · production cloud stays AWS (ADR-0012) until a new ADR.

## Sources

- [Managing endpoints in Serverless AI](https://docs.nebius.com/serverless/endpoints/manage)
- [Getting started with Serverless AI endpoints (nginx quickstart)](https://docs.nebius.com/serverless/quickstart/endpoints)
- [About Serverless AI](https://docs.nebius.com/serverless/overview)
- [Managing jobs in Serverless AI](https://docs.nebius.com/serverless/jobs/manage)
- [`nebius ai job create` CLI reference](https://docs.nebius.com/cli/reference/ai/job/create)
- [Nebius AI Cloud changelog](https://docs.nebius.com/changelog)
- [Compute pricing](https://docs.nebius.com/compute/resources/pricing)
