# docs

```
architecture/CONSTITUTION.md engineering & product constitution (the "README §N" references)
architecture/SOFTWARE-ARCHITECTURE.md  software architecture, CRISP-ML(Q), XP, Agile
architecture/adr/            architecture decision records — start here
hackathon/                   Nebius x NVIDIA hackathon program (active) — ADR-0035
design/                      design principles, Figma channel, toolchain, front architecture — ADR-0041
delivery/                    task delegation by branch and platform order
quality/                     quality harness inventory
ml/                          AI component cards (CRISP-ML(Q) phase 1)
architecture/c4/             context, container and component diagrams
architecture/threat-models/  per-feature threat models (required for R1+)
domain/                      bounded context documentation
product/features/            feature specifications
security/  privacy/          control and lifecycle documentation
operations/runbooks/         incident runbooks (README §94)
providers/                   provider integration notes and capability registry
financial-formulas/          formula documentation mirroring the code registry
releases/                    release evidence bundles (README §45)
```

Documentation here is meant to be load-bearing, not ceremonial (README §97). A document
that nobody would notice going stale probably should not exist.

Each package and application additionally carries its own `README.md` declaring
responsibility, what it owns, what it explicitly does not own, and its invariants
(README §98).

## Runbooks still to be written (README §94)

```
provider-down          db-latency              queue-backlog
auth-outage            suspected-account-takeover
pii-leak               incorrect-financial-calculation
bad-migration          rollback-release        compromised-secret
```

`incorrect-financial-calculation` is the one to write first: README §95 specifies the
exact sequence — kill switch, preserve evidence, identify the formula version, identify
affected Decision Cards, fix as a new version, verify against independent vectors,
supersede old recommendations, postmortem. Never edit history silently.
