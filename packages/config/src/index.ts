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
});

/** Jurisdiction defaults — README §36. Never hardcoded inside the core. */
const jurisdictionConfigSchema = z.object({
  locale: z.string().min(2),
  timezone: z.string().min(3),
  currency: z.string().length(3),
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
 * AI provider configuration — README §30, ADR-0036.
 *
 * Model IDs are configuration, never constants: providers rename models, and the IDs
 * must be confirmed against `GET /v1/models` with the team's key before they are
 * trusted (task S0-05). A tier with no model ID is reported as unavailable rather
 * than silently routed to another model.
 */
const aiConfigSchema = z.object({
  provider: z.literal('nebius-token-factory'),
  baseUrl: z.url(),
  models: z.object({
    FAST: z.string().min(1).optional(),
    AGENT: z.string().min(1).optional(),
    DEEP: z.string().min(1).optional(),
  }),
  requestTimeoutMs: z.coerce.number().int().min(1_000).max(120_000),
  maxOutputTokens: z.coerce.number().int().min(16).max(8_192),
});

/** Abuse limits for public endpoints — README §119 (rate limiting), §62. */
const limitsConfigSchema = z.object({
  requestsPerMinutePerClient: z.coerce.number().int().min(1).max(10_000),
  aiTurnsPerMinutePerClient: z.coerce.number().int().min(1).max(1_000),
});

/**
 * Secret config is kept in a separate shape so it can never be spread into a log
 * line or an error report alongside public values (README §12).
 */
const secretConfigSchema = z.object({
  databaseUrl: z.string().min(1),
  sentryDsn: z.string().optional(),
  authJwksUrl: z.string().optional(),
  nebiusApiKey: z.string().min(1).optional(),
});

export const configSchema = z.object({
  public: publicConfigSchema,
  jurisdiction: jurisdictionConfigSchema,
  flags: featureFlagSchema,
  ai: aiConfigSchema,
  limits: limitsConfigSchema,
  secrets: secretConfigSchema,
});

export type FinchConfig = z.infer<typeof configSchema>;
export type PublicConfig = z.infer<typeof publicConfigSchema>;
export type AiConfig = z.infer<typeof aiConfigSchema>;
export type LimitsConfig = z.infer<typeof limitsConfigSchema>;

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
 * Drop keys whose value is `undefined`.
 *
 * With `exactOptionalPropertyTypes`, an optional key must be absent rather than
 * present-and-undefined; this keeps the parsed object honest about what was set.
 */
function withoutUndefined<T extends Record<string, string | undefined>>(
  record: T,
): Partial<Record<keyof T, string>> {
  return Object.fromEntries(
    Object.entries(record).filter(([, value]) => value !== undefined),
  ) as Partial<Record<keyof T, string>>;
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
    },
    jurisdiction: {
      locale: env['FINCH_DEFAULT_LOCALE'],
      timezone: env['FINCH_DEFAULT_TIMEZONE'],
      currency: env['FINCH_DEFAULT_CURRENCY'],
    },
    flags: {
      bankSyncEnabled: env['FEATURE_BANK_SYNC_ENABLED'] === 'true',
      documentAiEnabled: env['FEATURE_DOCUMENT_AI_ENABLED'] === 'true',
      externalActionsEnabled: env['FEATURE_EXTERNAL_ACTIONS_ENABLED'] === 'true',
      paymentExecutionEnabled: env['FEATURE_PAYMENT_EXECUTION_ENABLED'] === 'true',
      aiExplanationsEnabled: env['FEATURE_AI_EXPLANATIONS_ENABLED'] === 'true',
    },
    ai: {
      provider: 'nebius-token-factory',
      baseUrl: optionalEnv(env['NEBIUS_BASE_URL']) ?? 'https://api.tokenfactory.nebius.com/v1/',
      models: withoutUndefined({
        FAST: optionalEnv(env['NEBIUS_MODEL_FAST']),
        AGENT: optionalEnv(env['NEBIUS_MODEL_AGENT']),
        DEEP: optionalEnv(env['NEBIUS_MODEL_DEEP']),
      }),
      requestTimeoutMs: optionalEnv(env['AI_REQUEST_TIMEOUT_MS']) ?? '30000',
      maxOutputTokens: optionalEnv(env['AI_MAX_OUTPUT_TOKENS']) ?? '1024',
    },
    limits: {
      requestsPerMinutePerClient: optionalEnv(env['API_RATE_LIMIT_PER_MINUTE']) ?? '120',
      aiTurnsPerMinutePerClient: optionalEnv(env['AI_TURNS_PER_MINUTE']) ?? '10',
    },
    secrets: withoutUndefined({
      databaseUrl: env['DATABASE_URL'],
      sentryDsn: optionalEnv(env['SENTRY_DSN']),
      authJwksUrl: optionalEnv(env['AUTH_JWKS_URL']),
      nebiusApiKey: optionalEnv(env['NEBIUS_API_KEY']),
    }),
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
    flags: config.flags,
    ai: config.ai,
    limits: config.limits,
    secrets: Object.fromEntries(
      Object.entries(config.secrets).map(([key, value]) => [
        key,
        value === undefined ? undefined : '[REDACTED]',
      ]),
    ),
  };
}
