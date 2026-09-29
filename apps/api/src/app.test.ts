/**
 * Walking skeleton end to end (task S0-07): the real Nest + Fastify app, the real AI
 * Gateway and the real OpenAI-compatible adapter, talking over HTTP to a local server
 * that stands in for Token Factory. Only the provider's location changes.
 */
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import type { AiCallRecord } from '@finch/ai-core';
import { loadConfig } from '@finch/config';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { afterAll, afterEach, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from './app.js';

let provider: Server;
let providerUrl = '';
let providerBodies: Record<string, unknown>[] = [];
let providerStatus = 200;

beforeAll(async () => {
  provider = createServer((req, res) => {
    let raw = '';
    req.on('data', (chunk: Buffer) => {
      raw += chunk.toString('utf8');
    });
    req.on('end', () => {
      providerBodies.push(JSON.parse(raw) as Record<string, unknown>);
      res.writeHead(providerStatus, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify(
          providerStatus === 200
            ? {
                model: 'fast-model-served',
                choices: [
                  { message: { content: 'An effective annual rate includes compounding.' } },
                ],
                usage: { prompt_tokens: 40, completion_tokens: 9 },
              }
            : { error: { message: 'provider internals' } },
        ),
      );
    });
  });
  await new Promise<void>((resolve) => provider.listen(0, '127.0.0.1', resolve));
  providerUrl = `http://127.0.0.1:${String((provider.address() as AddressInfo).port)}/v1/`;
});

afterAll(async () => {
  provider.closeAllConnections();
  await new Promise<void>((resolve) =>
    provider.close(() => {
      resolve();
    }),
  );
});

const apps: NestFastifyApplication[] = [];
afterEach(async () => {
  providerBodies = [];
  providerStatus = 200;
  await Promise.all(apps.splice(0).map((app) => app.close()));
});

function env(overrides: Record<string, string> = {}): Record<string, string> {
  return {
    NODE_ENV: 'test',
    FINCH_ENV: 'local',
    API_PORT: '4000',
    API_BASE_URL: 'http://localhost:4000',
    FINCH_DEFAULT_LOCALE: 'es-CO',
    FINCH_DEFAULT_TIMEZONE: 'America/Bogota',
    FINCH_DEFAULT_CURRENCY: 'COP',
    DATABASE_URL: 'postgresql://finch:finch_local_dev@localhost:5432/finch_test',
    FEATURE_AI_EXPLANATIONS_ENABLED: 'true',
    NEBIUS_API_KEY: 'test-key-never-logged',
    NEBIUS_BASE_URL: providerUrl,
    NEBIUS_MODEL_FAST: 'fast-model',
    ...overrides,
  };
}

async function start(overrides: Record<string, string> = {}, audit: AiCallRecord[] = []) {
  const app = await createApp(loadConfig(env(overrides)), {
    audit: { record: (entry) => audit.push(entry) },
    build: { service: 'finch-api', version: '0.0.0-test', commit: 'abc1234' },
  });
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
  apps.push(app);
  return app;
}

describe('GET /api/health', () => {
  it('reports build, environment and per-tier models without secrets', async () => {
    const app = await start();
    const response = await app.inject({ method: 'GET', url: '/api/health' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      status: 'ok',
      service: 'finch-api',
      version: '0.0.0-test',
      commit: 'abc1234',
      environment: 'local',
      ai: {
        provider: 'nebius-token-factory',
        endpointHost: new URL(providerUrl).host,
        enabled: true,
        tiers: [
          { tier: 'FAST', model: 'fast-model', available: true },
          { tier: 'AGENT', model: null, available: false },
          { tier: 'DEEP', model: null, available: false },
        ],
      },
    });
    expect(response.body).not.toContain('test-key-never-logged');
    expect(providerBodies).toHaveLength(0); // a health probe never spends credit
  });

  it('sets a correlation id and non-cacheable security headers', async () => {
    const app = await start();
    const response = await app.inject({ method: 'GET', url: '/api/health' });
    expect(response.headers['x-correlation-id']).toMatch(/^[0-9a-f-]{36}$/);
    expect(response.headers['cache-control']).toBe('no-store');
    expect(response.headers['x-content-type-options']).toBe('nosniff');
  });

  it('keeps a safe caller correlation id and replaces an unsafe one', async () => {
    const app = await start();
    const kept = await app.inject({
      method: 'GET',
      url: '/api/health',
      headers: { 'x-correlation-id': 'client-abc-12345' },
    });
    expect(kept.headers['x-correlation-id']).toBe('client-abc-12345');
    const replaced = await app.inject({
      method: 'GET',
      url: '/api/health',
      headers: { 'x-correlation-id': 'bad\r\nInjected: header' },
    });
    expect(replaced.headers['x-correlation-id']).not.toContain('Injected');
  });
});

describe('POST /api/v1/assistant/turns', () => {
  it('answers through the gateway, tagged as generated narrative', async () => {
    const audit: AiCallRecord[] = [];
    const app = await start({}, audit);
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/assistant/turns',
      payload: { message: 'What is an effective annual rate? Reach me at laura.demo@example.com' },
    });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      answer: 'An effective annual rate includes compounding.',
      truthClass: 'GENERATED_NARRATIVE',
      tier: 'FAST',
      model: 'fast-model-served',
      promptId: 'assistant.skeleton@1',
    });
    const sent = JSON.stringify(providerBodies[0]);
    expect(sent).toContain('"model":"fast-model"');
    expect(sent).not.toContain('laura.demo@example.com');
    expect(audit[0]).toMatchObject({ outcome: 'OK', redactionsCount: 1 });
    expect(audit[0]?.correlationId).toBe(response.headers['x-correlation-id']);
  });

  it('rejects an invalid body with the stable error shape', async () => {
    const app = await start();
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/assistant/turns',
      payload: { message: '', extra: true },
    });
    expect(response.statusCode).toBe(400);
    const body = response.json<{ error: Record<string, unknown> }>();
    expect(body.error).toMatchObject({ code: 'FINCH_VALIDATION_ERROR' });
    expect(body.error['correlationId']).toBe(response.headers['x-correlation-id']);
    expect(providerBodies).toHaveLength(0);
  });

  it('honours the kill switch', async () => {
    const app = await start({ FEATURE_AI_EXPLANATIONS_ENABLED: 'false' });
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/assistant/turns',
      payload: { message: 'Hello' },
    });
    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({ error: { code: 'FINCH_PROVIDER_AI_DISABLED' } });
    expect(providerBodies).toHaveLength(0);
  });

  it('never surfaces provider error text', async () => {
    providerStatus = 500;
    const app = await start();
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/assistant/turns',
      payload: { message: 'Hello' },
    });
    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({ error: { code: 'FINCH_PROVIDER_AI_UNAVAILABLE' } });
    expect(response.body).not.toContain('provider internals');
  });

  it('limits AI turns per client to protect inference credit', async () => {
    const app = await start({ AI_TURNS_PER_MINUTE: '2' });
    const ask = () =>
      app.inject({ method: 'POST', url: '/api/v1/assistant/turns', payload: { message: 'Hi' } });
    expect((await ask()).statusCode).toBe(200);
    expect((await ask()).statusCode).toBe(200);
    const limited = await ask();
    expect(limited.statusCode).toBe(429);
    expect(limited.json()).toMatchObject({ error: { code: 'FINCH_RATE_LIMIT_AI_TURNS' } });
    expect(Number(limited.headers['retry-after'])).toBeGreaterThan(0);
    expect(providerBodies).toHaveLength(2);
  });

  it('limits all requests per client', async () => {
    const app = await start({ API_RATE_LIMIT_PER_MINUTE: '1' });
    expect((await app.inject({ method: 'GET', url: '/api/health' })).statusCode).toBe(200);
    const limited = await app.inject({ method: 'GET', url: '/api/health' });
    expect(limited.statusCode).toBe(429);
    expect(limited.json()).toMatchObject({ error: { code: 'FINCH_RATE_LIMIT_REQUESTS' } });
  });

  it('answers unknown routes with the stable error shape', async () => {
    const app = await start();
    const response = await app.inject({ method: 'GET', url: '/api/v1/nope' });
    expect(response.statusCode).toBe(404);
    expect(response.json()).toMatchObject({ error: { code: 'FINCH_VALIDATION_NOT_FOUND' } });
  });
});
