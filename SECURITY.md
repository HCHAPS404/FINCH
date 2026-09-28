# Security Policy

FINCH is financial software. Security defects here are not inconveniences.

## Reporting a vulnerability

Do **not** open a public GitHub issue for a security vulnerability. This repository is
currently public; an issue is a disclosure.

Report privately through GitHub's private vulnerability reporting
(`Security` → `Report a vulnerability`) on this repository.

Please include: affected component, reproduction steps, impact assessment and any
suggested mitigation. We will acknowledge receipt and keep you informed of remediation
progress.

## Scope

In scope: authentication and session handling, authorization and tenancy isolation
(including cross-workspace access), financial calculation integrity, provenance
integrity, document handling, webhook verification, secret handling, supply chain,
admin surface, and the AI trust boundary (prompt injection, data leakage).

Out of scope at present: cloud infrastructure (not yet provisioned), payment rails
(not implemented), and any capability marked "boundary only" in its module README.

## Baseline

FINCH follows OWASP ASVS 5.0.0 for application controls, OWASP API Security Top 10
(2023) and OWASP MASVS/MASTG for mobile. Features at risk tier R1 and above carry a
threat model; R3/R4 require independent review before general availability.
See `docs/architecture/CONSTITUTION.md` §38–§39 and §74.

## Invariants we will not trade away

- Authorization is always evaluated server-side. Client-side checks are UX, never
  enforcement.
- Money is never represented as a binary float.
- A language model is never the authority on financial truth.
- Secrets never enter the repository, a client bundle, or a log line.
- Tokens, full account numbers, complete documents and raw provider payloads are never
  logged.
- No security control is weakened to make a test or a build pass.

## Automated controls

Every pull request runs: secret scanning (gitleaks), static analysis (CodeQL),
dependency review, architecture fitness checks, and the financial correctness harness.
Two of these self-test — they plant a known violation and assert it is rejected — so a
silently broken scanner fails the build rather than reporting green.
