/**
 * @finch/config — typed configuration, validated once at startup.
 *
 * README §61 separates public config, secret config, feature flags, jurisdiction
 * config, provider config and risk limits. They are kept apart here because they have
 * different sensitivity, different change cadence and different audit requirements —
 * a feature flag flip is routine, a risk-limit change is not (§61: "critical
 * configuration changes generan audit").
 *
 * Validation happens at startup, not at first use. A malformed DATABASE_URL should
 * stop the process immediately, not surface as a confusing error during a user's
 * first request.
 */
import { z } from 'zod';

/** Values safe to expose in logs and error reports. */
const publicConfigSchema = z.object({
  nodeEnv: z.enum(['development', 'test', 'production']),
  finchEnv: z.enum(['local', 'dev', 'integration', 'staging', 'prod']),
  apiPort: z.coerce.number().int().min(1).max(65_535),
  apiBaseUrl: z.url(),
  /** The one browser origin allowed to call this API cross-origin (CORS). */
  webAppOrigin: z.url(),
});

/** Jurisdiction defaults — README §36. Never hardcoded inside the core. */
const jurisdictionConfigSchema = z.object({
  locale: z.string().min(2),
  timezone: z.string().min(3),
  currency: z.string().length(3),
});

/**
 * Observability — README §46, §3.8, ADR-0024. Traces/metrics via OTel; Sentry is a
 * separate integration composed alongside `@finch/observability`, not inside it.
 */
const observabilityConfigSchema = z.object({
  logLevel: z.enum(['trace', 'debug', 'info', 'warn', 'error', 'fatal']),
  otelEnabled: z.coerce.boolean(),
  otelExporterOtlpEndpoint: z.url().optional(),
  otelServiceName: z.string().min(1),
  sentryEnvironment: z.string().min(1),
});

/**
 * Identity — README §8, ADR-0015 (still Proposed; no vendor chosen). Issuer/audience
 * are ordinary OIDC discovery values, not secrets; `authJwksUrl` stays in
 * `secretConfigSchema` below since an empty value must be treated as "no provider
 * configured yet" the same way a missing secret is.
 */
const identityConfigSchema = z.object({
  authIssuerUrl: z.url().optional(),
  authAudience: z.string().min(1).optional(),
});

/**
 * Kill switches — README §62.
 *
 * Present and wired from day one even though every capability behind them is still
 * unbuilt. A kill switch added during an incident is a kill switch nobody has tested.
 */
const featureFlagSchema = z.object({
  bankSyncEnabled: z.coerce.boolean(),
  documentAiEnabled: z.coerce.boolean(),
  externalActionsEnabled: z.coerce.boolean(),
  paymentExecutionEnabled: z.coerce.boolean(),
  aiExplanationsEnabled: z.coerce.boolean(),
});

/**
 * Secret config is kept in a separate shape so it can never be spread into a log
 * line or an error report alongside public values (README §12).
 *
 * `authSessionSecret` signs `PasswordAuthSessionAdapter`'s opaque session tokens
 * (ADR-0041) — unlike the dev sandbox's per-process random secret, this one must be
 * stable across restarts so a real user's session survives a deploy, which is why it
 * is configured rather than generated.
 */
const secretConfigSchema = z.object({
  databaseUrl: z.string().min(1),
  sentryDsn: z.string().optional(),
  authJwksUrl: z.string().optional(),
  authSessionSecret: z.string().min(32),
});

/**
 * Local-disk document storage (ADR-0041) — a `DocumentStoragePort` adapter, swappable
 * for S3 later per ADR-0022, without this schema or its callers changing shape.
 */
const storageConfigSchema = z.object({
  documentsStorageDir: z.string().min(1),
});

export const configSchema = z.object({
  public: publicConfigSchema,
  jurisdiction: jurisdictionConfigSchema,
  observability: observabilityConfigSchema,
  identity: identityConfigSchema,
  flags: featureFlagSchema,
  secrets: secretConfigSchema,
  storage: storageConfigSchema,
});

export type FinchConfig = z.infer<typeof configSchema>;
export type PublicConfig = z.infer<typeof publicConfigSchema>;

/**
 * Treat an empty or whitespace-only environment variable as absent.
 *
 * `SENTRY_DSN=` in a .env file yields `''`, not `undefined`. Passing that through
 * would configure Sentry with an empty DSN and fail at runtime instead of cleanly
 * disabling the integration. Written explicitly rather than as `value || undefined`
 * so the intent is legible and `??` is not mistakenly substituted later.
 */
function optionalEnv(value: string | undefined): string | undefined {
  if (value === undefined) return undefined;
  const trimmed = value.trim();
  return trimmed === '' ? undefined : trimmed;
}

/**
 * Build configuration from an environment record.
 *
 * Takes the environment as a parameter rather than reading `process.env` directly, so
 * the function stays pure and testable and so pure layers never gain an excuse to
 * touch the process object.
 */
export function loadConfig(env: Record<string, string | undefined>): FinchConfig {
  const result = configSchema.safeParse({
    public: {
      nodeEnv: env['NODE_ENV'],
      finchEnv: env['FINCH_ENV'],
      apiPort: env['API_PORT'],
      apiBaseUrl: env['API_BASE_URL'],
      webAppOrigin: env['WEB_APP_ORIGIN'],
    },
    jurisdiction: {
      locale: env['FINCH_DEFAULT_LOCALE'],
      timezone: env['FINCH_DEFAULT_TIMEZONE'],
      currency: env['FINCH_DEFAULT_CURRENCY'],
    },
    observability: {
      logLevel: env['LOG_LEVEL'],
      otelEnabled: env['OTEL_ENABLED'] === 'true',
      otelExporterOtlpEndpoint: optionalEnv(env['OTEL_EXPORTER_OTLP_ENDPOINT']),
      otelServiceName: env['OTEL_SERVICE_NAME'],
      sentryEnvironment: env['SENTRY_ENVIRONMENT'],
    },
    identity: {
      authIssuerUrl: optionalEnv(env['AUTH_ISSUER_URL']),
      authAudience: optionalEnv(env['AUTH_AUDIENCE']),
    },
    flags: {
      bankSyncEnabled: env['FEATURE_BANK_SYNC_ENABLED'] === 'true',
      documentAiEnabled: env['FEATURE_DOCUMENT_AI_ENABLED'] === 'true',
      externalActionsEnabled: env['FEATURE_EXTERNAL_ACTIONS_ENABLED'] === 'true',
      paymentExecutionEnabled: env['FEATURE_PAYMENT_EXECUTION_ENABLED'] === 'true',
      aiExplanationsEnabled: env['FEATURE_AI_EXPLANATIONS_ENABLED'] === 'true',
    },
    secrets: {
      databaseUrl: env['DATABASE_URL'],
      sentryDsn: optionalEnv(env['SENTRY_DSN']),
      authJwksUrl: optionalEnv(env['AUTH_JWKS_URL']),
      authSessionSecret: env['AUTH_SESSION_SECRET'],
    },
    storage: {
      documentsStorageDir: env['DOCUMENTS_STORAGE_DIR'],
    },
  });

  if (!result.success) {
    // Report which keys are wrong, never their values — a malformed DATABASE_URL
    // still contains a password (README §12).
    const problems = result.error.issues
      .map((issue) => `  - ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(
      `Invalid FINCH configuration. Fix these before the process can start:\n${problems}\n\n` +
        'See .env.example for the expected keys (README §61).',
    );
  }

  return result.data;
}

/** Redacted view, safe to log or attach to an error report. */
export function redactedConfig(config: FinchConfig): Record<string, unknown> {
  return {
    public: config.public,
    jurisdiction: config.jurisdiction,
    observability: config.observability,
    identity: config.identity,
    flags: config.flags,
    secrets: Object.fromEntries(
      Object.entries(config.secrets).map(([key, value]) => [
        key,
        value === undefined ? undefined : '[REDACTED]',
      ]),
    ),
    storage: config.storage,
  };
}
