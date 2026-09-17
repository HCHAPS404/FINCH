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
 * Secret config is kept in a separate shape so it can never be spread into a log
 * line or an error report alongside public values (README §12).
 */
const secretConfigSchema = z.object({
  databaseUrl: z.string().min(1),
  sentryDsn: z.string().optional(),
  authJwksUrl: z.string().optional(),
});

export const configSchema = z.object({
  public: publicConfigSchema,
  jurisdiction: jurisdictionConfigSchema,
  flags: featureFlagSchema,
  secrets: secretConfigSchema,
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
    secrets: {
      databaseUrl: env['DATABASE_URL'],
      sentryDsn: optionalEnv(env['SENTRY_DSN']),
      authJwksUrl: optionalEnv(env['AUTH_JWKS_URL']),
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
    flags: config.flags,
    secrets: Object.fromEntries(
      Object.entries(config.secrets).map(([key, value]) => [
        key,
        value === undefined ? undefined : '[REDACTED]',
      ]),
    ),
  };
}
