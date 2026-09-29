/**
 * API ↔ PostgreSQL 18.6 (Testcontainers): readiness and the persisted AI audit trail.
 * The provider is a local HTTP server; everything else is the production wiring,
 * including the database connection built from DATABASE_URL.
 */
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';

import { loadConfig } from '@finch/config';
import { aiCalls, connect, runMigrations, type DatabaseHandle } from '@finch/db';
import type { NestFastifyApplication } from '@nestjs/platform-fastify';
import { PostgreSqlContainer, type StartedPostgreSqlContainer } from '@testcontainers/postgresql';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';

import { createApp } from './app.js';

let container: StartedPostgreSqlContainer;
let provider: Server;
let app: NestFastifyApplication;
let reader: DatabaseHandle;

beforeAll(async () => {
  container = await new PostgreSqlContainer('postgres:18.6-trixie').start();
  reader = connect({ url: container.getConnectionUri(), maxConnections: 1 });
  await runMigrations(reader.db);

  provider = createServer((req, res) => {
    req.resume();
    req.on('end', () => {
      res.writeHead(200, { 'content-type': 'application/json' });
      res.end(
        JSON.stringify({
          model: 'fast-model-served',
          choices: [{ message: { content: 'A budget is a plan for your money.' } }],
          usage: { prompt_tokens: 30, completion_tokens: 8 },
        }),
      );
    });
  });
  await new Promise<void>((resolve) => provider.listen(0, '127.0.0.1', resolve));
  const providerUrl = `http://127.0.0.1:${String((provider.address() as AddressInfo).port)}/v1/`;

  const config = loadConfig({
    NODE_ENV: 'test',
    FINCH_ENV: 'local',
    API_PORT: '4000',
    API_BASE_URL: 'http://localhost:4000',
    FINCH_DEFAULT_LOCALE: 'es-CO',
    FINCH_DEFAULT_TIMEZONE: 'America/Bogota',
    FINCH_DEFAULT_CURRENCY: 'COP',
    DATABASE_URL: container.getConnectionUri(),
    FEATURE_AI_EXPLANATIONS_ENABLED: 'true',
    NEBIUS_API_KEY: 'test-key',
    NEBIUS_BASE_URL: providerUrl,
    NEBIUS_MODEL_FAST: 'fast-model',
  });
  app = await createApp(config); // production wiring: connects to DATABASE_URL itself
  await app.init();
  await app.getHttpAdapter().getInstance().ready();
}, 180_000);

afterAll(async () => {
  await app.close();
  await reader.close();
  provider.closeAllConnections();
  await new Promise<void>((resolve) => {
    provider.close(() => {
      resolve();
    });
  });
  await container.stop();
});

describe('API with PostgreSQL', () => {
  it('is ready when the database answers', async () => {
    const response = await app.inject({ method: 'GET', url: '/api/ready' });
    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: 'ready', database: 'up' });
  });

  it('persists each AI call to audit.ai_calls without any content', async () => {
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/assistant/turns',
      headers: { 'x-correlation-id': 'integration-corr-001' },
      payload: { message: 'What is a budget? My email is laura.demo@example.com' },
    });
    expect(response.statusCode).toBe(200);

    // Audit writes are queued so they never delay the answer; poll briefly.
    let rows: (typeof aiCalls.$inferSelect)[] = [];
    for (let attempt = 0; attempt < 50 && rows.length === 0; attempt += 1) {
      rows = await reader.db.select().from(aiCalls);
      if (rows.length === 0) await new Promise((resolve) => setTimeout(resolve, 50));
    }
    expect(rows).toHaveLength(1);
    expect(rows[0]).toMatchObject({
      correlationId: 'integration-corr-001',
      tier: 'FAST',
      model: 'fast-model-served',
      promptId: 'assistant.skeleton@1',
      outcome: 'OK',
      inputTokens: 30,
      outputTokens: 8,
      redactionsCount: 1,
    });
    expect(JSON.stringify(rows)).not.toContain('laura.demo');
    expect(JSON.stringify(rows)).not.toContain('budget');
  });
});
