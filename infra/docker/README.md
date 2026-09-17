# infra/docker

Local development infrastructure. See `compose.yaml`.

Scope discipline (Constitution §4.19, README §77): this contains **PostgreSQL 18.6 and
nothing else**. Redis, LocalStack, OpenSearch and similar are added only when a
concrete capability requires them and an ADR records the decision.

```bash
pnpm dev:infra        # start
pnpm dev:infra:down   # stop
```

Credentials in `compose.yaml` are local-only placeholders and are safe in version
control. Production credentials come from AWS Secrets Manager (README §40).
