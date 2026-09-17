# infra/tofu

Infrastructure as code for FINCH, using **OpenTofu 1.12.6** (README §56; latest release
verified 2026-09-17).

> **Status: no resources defined, nothing provisioned.**
>
> Foundation produces infrastructure _code_ only. No AWS resource has been created, and
> none will be without the review README §32 requires: resources, region, expected cost
> class, security impact, networking topology and destroy strategy — presented, and
> explicitly authorized, before any `apply`.

## Layout

```
modules/                 reusable building blocks
environments/dev/        first real target, when authorized
environments/staging/
environments/prod/       separated from nonprod by design (§41), even before it exists
```

## Design constraints (README §41, §42, §93)

- **Account separation.** Production and non-production are separate AWS accounts
  before any real financial data exists.
- **Network topology.** Public subnets for load balancing only where necessary; private
  application subnets for workloads; isolated data subnets for RDS and cache. VPC
  endpoints where they reduce exposure or egress cost.
- **Workload identity.** One role per workload — `finch-api-role`, `finch-worker-role`,
  `finch-document-role`, `finch-provider-sync-role`, `finch-notification-role`,
  `finch-payment-role`, `finch-ci-deploy-role`. **No shared master role.**
- **No long-lived AWS credentials in CI.** GitHub OIDC only (§40).
- **FinOps tagging is mandatory** on every resource: `project=finch`, `environment`,
  `service`, `owner`, `managed-by=tofu` (§93).

## State

Remote state backend and locking are specified in `ADR-0025` and must be decided before
the first `apply`. State files are gitignored — they contain secrets.

## Local verification

```bash
tofu fmt -recursive -check
tofu validate
```

`tofu plan` requires AWS credentials, which are not configured in this environment.
`tofu apply` requires explicit human authorization, per resource set.
