# Architecture Decision Records

An ADR records a decision and the reasoning available at the time. Records are never
rewritten to look wiser in hindsight — they are superseded by a new record.

README §76 lists the changes that require an ADR **before** implementation: a new
database, a new runtime or language, a service extraction, EKS, Kafka/MSK, Temporal or
Step Functions as core workflow, a core vendor, an authorization change, a payment or
ledger change, a new trust boundary, a change to the Architecture Constitution, a data
residency change, or a breaking contract.

Use [`0000-template.md`](0000-template.md) for new records.

## Status of this set

ADR-0001 through ADR-0032 are the minimum set required by README §99. They are created
here so every decision is discoverable and supersedable, with the Decision section
filled in from the README — but their Context, Alternatives and Consequences sections
are explicitly marked **Outstanding** rather than filled with plausible-sounding prose.
An ADR that fabricates the reasoning behind a decision is worse than one that admits
the reasoning is not yet written down.

ADR-0035 to ADR-0041 are complete proposals for the hackathon program (`docs/hackathon/`),
awaiting the founders' decision.

ADR-0033 and ADR-0034 are complete records: they document decisions actually taken
during the Foundation bootstrap, with the evidence that drove them.

> References of the form `README.md §N` in ADR-0001…0034 point to what is now
> `docs/architecture/CONSTITUTION.md` §N (moved by ADR-0040).

## Index

| ADR                                                              | Title                                                                        | Status   | README reference            |
| ---------------------------------------------------------------- | ---------------------------------------------------------------------------- | -------- | --------------------------- |
| [ADR-0001](0001-architecture-style.md)                           | Modular monolith with deployable boundaries                                  | Accepted | §19.1, §87, §113            |
| [ADR-0002](0002-primary-language.md)                             | TypeScript as the primary language                                           | Accepted | §56, §57, §113              |
| [ADR-0003](0003-monorepo.md)                                     | Single pnpm + Turborepo monorepo                                             | Accepted | §55, §56                    |
| [ADR-0004](0004-mobile-stack.md)                                 | React Native with Expo for Android and iOS                                   | Accepted | §33.1, §113                 |
| [ADR-0005](0005-web-stack.md)                                    | Next.js and React for the web surface                                        | Accepted | §33.2, §113                 |
| [ADR-0006](0006-desktop-stack.md)                                | Tauri 2 with React and Vite for desktop                                      | Accepted | §33.3, §113                 |
| [ADR-0007](0007-backend-stack.md)                                | NestJS on the Fastify adapter                                                | Accepted | §19.2, §113                 |
| [ADR-0008](0008-api-contract-version.md)                         | OpenAPI revision for the API contract                                        | Proposed | §3.7, §58, §112             |
| [ADR-0009](0009-postgres-source-of-truth.md)                     | PostgreSQL as the OLTP source of truth                                       | Accepted | §24.1, §113                 |
| [ADR-0010](0010-tenancy-principal-party-workspace.md)            | Principal / Party / Workspace tenancy model                                  | Accepted | §3.1, §8, §113              |
| [ADR-0011](0011-authorization-model.md)                          | Relational authorization over RBAC                                           | Accepted | §3.2, §9, §113              |
| [ADR-0012](0012-aws-primary-cloud.md)                            | AWS as the primary cloud                                                     | Accepted | §41, §113                   |
| [ADR-0013](0013-compute-strategy.md)                             | ECS/Fargate default, Lambda where suited, EKS on capability need             | Accepted | §23                         |
| [ADR-0014](0014-async-outbox-sqs-eventbridge.md)                 | Transactional outbox published to SQS and EventBridge                        | Accepted | §21, §113                   |
| [ADR-0015](0015-identity-provider.md)                            | OIDC identity provider selection                                             | Proposed | §40, §112, §117             |
| [ADR-0016](0016-money-precision.md)                              | Monetary precision representation                                            | Accepted | Constitution §4.3, §14.1    |
| [ADR-0017](0017-financial-engine-boundary.md)                    | The financial engine is a pure library                                       | Accepted | §14, §64                    |
| [ADR-0018](0018-ai-gateway.md)                                   | All AI runtime access passes through an AI Gateway                           | Proposed | §30, §31, §32               |
| [ADR-0019](0019-no-graph-db-until-trigger.md)                    | No graph database until a benchmarked trigger exists                         | Accepted | §90                         |
| [ADR-0020](0020-streaming-trigger-policy.md)                     | No Kafka/MSK until stream semantics are genuinely required                   | Accepted | §23.4, §90, §100            |
| [ADR-0021](0021-no-custody-v1.md)                                | No custody of funds in v1                                                    | Accepted | §18, §106, §113             |
| [ADR-0022](0022-provider-abstraction.md)                         | Providers are consumed through internal ports                                | Accepted | Constitution §4.9, §27, §28 |
| [ADR-0023](0023-admin-separate-surface.md)                       | Admin is a separate application                                              | Accepted | Constitution §4.17, §52     |
| [ADR-0024](0024-observability.md)                                | OpenTelemetry for traces and metrics, structured logs separately             | Accepted | §3.8, §46                   |
| [ADR-0025](0025-opentofu.md)                                     | OpenTofu for infrastructure as code                                          | Accepted | §56, §113                   |
| [ADR-0026](0026-trunk-development.md)                            | Trunk-based development                                                      | Accepted | §70, §113                   |
| [ADR-0027](0027-audit-semantics.md)                              | Audit log and application log are different mechanisms                       | Accepted | Constitution §4.14, §54     |
| [ADR-0028](0028-data-classification.md)                          | Five data classification levels                                              | Accepted | §31                         |
| [ADR-0029](0029-document-pipeline.md)                            | Quarantine-first document processing                                         | Accepted | Constitution §4.7, §29      |
| [ADR-0030](0030-expand-contract-migrations.md)                   | Expand / migrate / contract database migrations                              | Accepted | §72                         |
| [ADR-0031](0031-data-zones.md)                                   | Four data zones: RAW, CANONICAL, DERIVED, ANALYTICAL                         | Accepted | §3.4, §12                   |
| [ADR-0032](0032-feature-risk-tiers.md)                           | Five feature risk tiers R0 to R4                                             | Accepted | §18, §74                    |
| [ADR-0033](0033-typescript-compiler-line.md)                     | Pin TypeScript to the 6.0.x line, defer TypeScript 7                         | Accepted | §56, §57, §64               |
| [ADR-0034](0034-node-runtime-and-toolchain-pinning.md)           | Pin the Node runtime to 24.21.0 LTS and reproduce the toolchain via corepack | Accepted | §56, §81                    |
| [ADR-0035](0035-hackathon-program-and-scope.md)                  | Nebius x NVIDIA hackathon as the first delivery program                      | Proposed | §76, §83, §84               |
| [ADR-0036](0036-ai-runtime-nebius-token-factory-nemotron.md)     | AI runtime on Nebius Token Factory with tiered NVIDIA Nemotron models        | Proposed | §30, §112                   |
| [ADR-0037](0037-open-source-license.md)                          | Apache-2.0 license and open-core boundary                                    | Proposed | §96                         |
| [ADR-0038](0038-hackathon-demo-deployment-topology.md)           | Hackathon demo deployment topology                                           | Proposed | §41, §79                    |
| [ADR-0039](0039-channel-hub.md)                                  | Autonomous app with an optional Channel Hub                                  | Proposed | §27, §115                   |
| [ADR-0040](0040-engineering-method-and-branching.md)             | Engineering method (XP + Agile + CRISP-ML(Q)) and stage branching            | Proposed | §67, §70                    |
| [ADR-0041](0041-design-system-and-frontend-toolchain.md)         | Design system, Figma channel and front-end toolchain                         | Proposed | §34, §35                    |
| [ADR-0042](0042-nestjs-lint-scope-and-dependency-release-age.md) | NestJS lint scope and dependency release age                                 | Accepted | §43, §57                    |

## Open decisions

README §112 keeps these deliberately open. Keeping them reversible today is a
strength, not a gap:

- ADR-0008 — OpenAPI 3.1.x vs 3.2.x, pending codegen compatibility testing
- ADR-0015 — the OIDC identity provider
- ADR-0018 — the AI runtime provider mix (ADR-0036 proposes Nebius Token Factory + Nemotron)
- Initial Open Finance provider, document extraction provider, payment partner
- Temporal vs Step Functions, when the first durable workflow appears
- Redis / OpenSearch / graph / warehouse adoption triggers
- Data residency commitments
