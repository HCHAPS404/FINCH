# syntax=docker/dockerfile:1
# FINCH API container — task S0-07 (deployable by both topologies in ADR-0038).
#
# Build from the repository root:
#   docker build -f apps/api/Dockerfile -t finch-api .
# Behind a TLS-intercepting proxy, pass its CA as a BuildKit secret (never baked in):
#   docker build --secret id=extra_ca,src=/path/to/ca.pem -f apps/api/Dockerfile -t finch-api .
#
# - Base image pinned by digest (README §43): node:24.21.0-trixie-slim.
# - Frozen lockfile, the same supply-chain policy as CI (minimum release age, denied
#   install scripts), and `pnpm deploy` so the runtime image carries production
#   dependencies only.
# - Runs as the unprivileged `node` user. No secrets are baked in: configuration comes
#   from the environment at runtime (README §40, §61).

ARG NODE_IMAGE=node:24.21.0-trixie-slim@sha256:8ec5d7557396cfe32d21c3f9c13072355ceab22b584578ca4bb28af31120cffe

FROM ${NODE_IMAGE} AS build
ENV COREPACK_ENABLE_DOWNLOAD_PROMPT=0
WORKDIR /repo
COPY . .
# The optional CA secret is mounted only for the steps that reach the network.
RUN --mount=type=secret,id=extra_ca,required=false \
    if [ -f /run/secrets/extra_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/extra_ca; fi \
    && corepack enable \
    && pnpm install --frozen-lockfile
RUN pnpm exec turbo run build --filter=@finch/api...
RUN --mount=type=secret,id=extra_ca,required=false \
    if [ -f /run/secrets/extra_ca ]; then export NODE_EXTRA_CA_CERTS=/run/secrets/extra_ca; fi \
    && pnpm --filter @finch/api deploy --prod --legacy /out

FROM ${NODE_IMAGE} AS runtime
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build --chown=node:node /out ./
USER node
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:' + (process.env.API_PORT ?? '4000') + '/api/health').then(r => process.exit(r.ok ? 0 : 1)).catch(() => process.exit(1))"]
CMD ["node", "--enable-source-maps", "dist/main.js"]
