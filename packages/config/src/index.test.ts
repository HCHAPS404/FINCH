/**
 * Configuration tests — README §61, §12.
 *
 * The redaction behaviour here is security-relevant, not cosmetic: a config object
 * spread into a log line or a Sentry event is one of the most common ways a database
 * password reaches a third party. It gets a test.
 */
import { describe, it, expect } from 'vitest';
import { loadConfig, redactedConfig } from './index.js';

const VALID = {
  NODE_ENV: 'development',
  FINCH_ENV: 'local',
  API_PORT: '4000',
  API_BASE_URL: 'http://localhost:4000',
  FINCH_DEFAULT_LOCALE: 'es-CO',
  FINCH_DEFAULT_TIMEZONE: 'America/Bogota',
  FINCH_DEFAULT_CURRENCY: 'COP',
  DATABASE_URL: 'postgresql://finch:supersecret@localhost:5432/finch_dev',
  SENTRY_DSN: '',
  AUTH_JWKS_URL: '',
  FEATURE_BANK_SYNC_ENABLED: 'false',
  FEATURE_DOCUMENT_AI_ENABLED: 'false',
  FEATURE_EXTERNAL_ACTIONS_ENABLED: 'false',
  FEATURE_PAYMENT_EXECUTION_ENABLED: 'false',
  FEATURE_AI_EXPLANATIONS_ENABLED: 'false',
};

describe('loadConfig', () => {
  it('parses a complete valid environment', () => {
    const config = loadConfig(VALID);
    expect(config.public.apiPort).toBe(4000);
    expect(config.jurisdiction.currency).toBe('COP');
    expect(config.jurisdiction.timezone).toBe('America/Bogota');
    expect(config.secrets.databaseUrl).toContain('postgresql://');
  });

  it('treats an empty optional variable as absent, not as an empty string', () => {
    // `SENTRY_DSN=` in a .env file yields '', which would configure Sentry with a
    // broken DSN rather than cleanly disabling it.
    const config = loadConfig(VALID);
    expect(config.secrets.sentryDsn).toBeUndefined();
    expect(config.secrets.authJwksUrl).toBeUndefined();
  });

  it('ships every kill switch disabled by default', () => {
    // README §62: the kill path exists from day one. A switch first exercised during
    // an incident is a switch nobody has tested.
    const config = loadConfig(VALID);
    expect(config.flags).toEqual({
      bankSyncEnabled: false,
      documentAiEnabled: false,
      externalActionsEnabled: false,
      paymentExecutionEnabled: false,
      aiExplanationsEnabled: false,
    });
  });

  it('fails fast on a missing required value', () => {
    const { DATABASE_URL: _omitted, ...incomplete } = VALID;
    expect(() => loadConfig(incomplete)).toThrow(/Invalid FINCH configuration/);
  });

  it('fails fast on a malformed value', () => {
    expect(() => loadConfig({ ...VALID, API_BASE_URL: 'not-a-url' })).toThrow(
      /Invalid FINCH configuration/,
    );
    expect(() => loadConfig({ ...VALID, FINCH_ENV: 'wherever' })).toThrow(
      /Invalid FINCH configuration/,
    );
    expect(() => loadConfig({ ...VALID, API_PORT: '70000' })).toThrow(
      /Invalid FINCH configuration/,
    );
  });

  it('never includes a secret value in a validation error message', () => {
    // A malformed DATABASE_URL still contains a password (README §12).
    let message = '';
    try {
      loadConfig({ ...VALID, DATABASE_URL: '' });
    } catch (error) {
      message = error instanceof Error ? error.message : String(error);
    }
    expect(message).toMatch(/Invalid FINCH configuration/);
    expect(message).not.toContain('supersecret');
  });
});

describe('redactedConfig', () => {
  it('redacts every secret while preserving public values', () => {
    const redacted = redactedConfig(loadConfig(VALID));
    expect(redacted['public']).toMatchObject({ apiPort: 4000, finchEnv: 'local' });
    expect(redacted['secrets']).toEqual({
      databaseUrl: '[REDACTED]',
      sentryDsn: undefined,
      authJwksUrl: undefined,
    });
  });

  it('leaks no secret substring anywhere in its serialized form', () => {
    // The real failure mode is a secret surviving somewhere unexpected in the object,
    // so assert against the whole serialization rather than one field.
    const serialized = JSON.stringify(redactedConfig(loadConfig(VALID)));
    expect(serialized).not.toContain('supersecret');
    expect(serialized).not.toContain('postgresql://');
  });
});

describe('AI provider configuration (README §30, ADR-0036)', () => {
  it('defaults to the Token Factory endpoint with no model assumed', () => {
    const config = loadConfig(VALID);
    expect(config.ai.provider).toBe('nebius-token-factory');
    expect(config.ai.baseUrl).toBe('https://api.tokenfactory.nebius.com/v1/');
    // Model IDs must be confirmed with GET /v1/models (task S0-05); none is invented.
    expect(config.ai.models).toEqual({});
    expect(config.secrets.nebiusApiKey).toBeUndefined();
  });

  it('reads model IDs per tier and treats an empty tier as unconfigured', () => {
    const config = loadConfig({
      ...VALID,
      NEBIUS_MODEL_FAST: 'fast-model-id',
      NEBIUS_MODEL_AGENT: 'agent-model-id',
      NEBIUS_MODEL_DEEP: '   ',
    });
    expect(config.ai.models).toEqual({ FAST: 'fast-model-id', AGENT: 'agent-model-id' });
  });

  it('rejects a malformed provider URL and out-of-range limits', () => {
    expect(() => loadConfig({ ...VALID, NEBIUS_BASE_URL: 'not a url' })).toThrow(
      /Invalid FINCH configuration/,
    );
    expect(() => loadConfig({ ...VALID, AI_REQUEST_TIMEOUT_MS: '10' })).toThrow(
      /Invalid FINCH configuration/,
    );
    expect(() => loadConfig({ ...VALID, AI_TURNS_PER_MINUTE: '0' })).toThrow(
      /Invalid FINCH configuration/,
    );
  });

  it('redacts the provider API key', () => {
    const serialized = JSON.stringify(
      redactedConfig(loadConfig({ ...VALID, NEBIUS_API_KEY: 'tf-key-must-not-leak' })),
    );
    expect(serialized).not.toContain('tf-key-must-not-leak');
    expect(serialized).toContain('[REDACTED]');
  });
});
