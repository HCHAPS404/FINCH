/**
 * Composition root — the only place adapters are wired to ports (apps/api/README.md).
 *
 * `createApp` is used by `main.ts` and by the tests, so what is tested is what runs.
 */
import 'reflect-metadata';

import {
  AiGateway,
  OpenAiCompatibleInference,
  type AiAuditSink,
  type InferencePort,
} from '@finch/ai-core';
import type { FinchConfig } from '@finch/config';
import { connect, type DatabaseHandle } from '@finch/db';
import { ConsoleLogger, Module, type DynamicModule, type LoggerService } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';

import { DatabaseAiAuditSink, type AuditLogger } from './infrastructure/db-ai-audit-sink.js';
import { AssistantController } from './modules/assistant/adapters/assistant.controller.js';
import { HealthController } from './modules/health/health.controller.js';
import { ReadinessController } from './modules/health/readiness.controller.js';
import { CORRELATION_HEADER, resolveCorrelationId } from './platform/correlation.js';
import { FinchExceptionFilter, FinchHttpError, mapError } from './platform/errors.js';
import { FixedWindowLimiter } from './platform/rate-limit.js';
import {
  AI_GATEWAY,
  AI_TURN_LIMITER,
  BUILD_INFO,
  CONFIG,
  DATABASE,
  type BuildInfo,
} from './platform/tokens.js';

export interface AppOverrides {
  /** Replace the provider adapter (tests use a real local HTTP server instead). */
  readonly inference?: InferencePort;
  readonly audit?: AiAuditSink;
  readonly build?: BuildInfo;
  /**
   * The database. Omitted: connect to `DATABASE_URL` (production path). `null`: run
   * without a database — `/api/ready` reports it and AI calls are not persisted.
   */
  readonly database?: DatabaseHandle | null;
}

interface Wiring {
  readonly database: DatabaseHandle | null;
  readonly audit: AiAuditSink;
}

const MINUTE_MS = 60_000;

@Module({})
class AppModule {
  static register(config: FinchConfig, overrides: AppOverrides, wiring: Wiring): DynamicModule {
    const apiKey = config.secrets.nebiusApiKey;
    const inference =
      overrides.inference ??
      (apiKey === undefined
        ? undefined
        : new OpenAiCompatibleInference({
            baseUrl: config.ai.baseUrl,
            apiKey,
            timeoutMs: config.ai.requestTimeoutMs,
          }));

    return {
      module: AppModule,
      controllers: [HealthController, ReadinessController, AssistantController],
      providers: [
        { provide: CONFIG, useValue: config },
        { provide: DATABASE, useValue: wiring.database },
        {
          provide: BUILD_INFO,
          useValue: overrides.build ?? {
            service: 'finch-api',
            version: process.env['npm_package_version'] ?? '0.0.0',
            commit: process.env['FINCH_COMMIT_SHA'],
          },
        },
        {
          provide: AI_TURN_LIMITER,
          useValue: new FixedWindowLimiter(config.limits.aiTurnsPerMinutePerClient, MINUTE_MS),
        },
        {
          provide: AI_GATEWAY,
          useValue: new AiGateway({
            port: inference,
            models: config.ai.models,
            enabled: config.flags.aiExplanationsEnabled,
            maxOutputTokens: config.ai.maxOutputTokens,
            audit: wiring.audit,
          }),
        },
      ],
    };
  }
}

/**
 * Framework logs: silent in tests, structured JSON without colors in production
 * (README §46: logs are machine-parseable), human-readable locally.
 */
function nestLogger(config: FinchConfig): LoggerService | false {
  if (config.public.nodeEnv === 'test') return false;
  if (config.public.nodeEnv === 'production') {
    return new ConsoleLogger({ json: true, colors: false, logLevels: ['error', 'warn', 'log'] });
  }
  return new ConsoleLogger({ logLevels: ['error', 'warn', 'log'] });
}

export async function createApp(
  config: FinchConfig,
  overrides: AppOverrides = {},
): Promise<NestFastifyApplication> {
  const adapter = new FastifyAdapter({
    // Small JSON bodies only; uploads get their own quarantined path (README §29).
    bodyLimit: 16 * 1024,
    // Behind the hosting proxy the client IP is in X-Forwarded-For; locally it is not.
    trustProxy: config.public.finchEnv !== 'local',
    logger:
      config.public.nodeEnv === 'test'
        ? false
        : { level: 'info', redact: ['req.headers.authorization'] },
  });
  const fastifyLog = adapter.getInstance().log;
  const auditLogger: AuditLogger = {
    error: (details, message) => {
      fastifyLog.error(details, message);
    },
  };
  const ownsDatabase = overrides.database === undefined;
  const database =
    overrides.database === undefined
      ? connect({ url: config.secrets.databaseUrl })
      : overrides.database;
  const dbSink = database === null ? undefined : new DatabaseAiAuditSink(database.db, auditLogger);
  const audit: AiAuditSink = overrides.audit ?? dbSink ?? { record: () => undefined };

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.register(config, overrides, { database, audit }),
    adapter,
    { logger: nestLogger(config) },
  );

  const requestLimiter = new FixedWindowLimiter(
    config.limits.requestsPerMinutePerClient,
    MINUTE_MS,
  );
  const fastify = app.getHttpAdapter().getInstance();

  fastify.addHook('onRequest', async (request, reply) => {
    const correlationId = resolveCorrelationId(request.headers[CORRELATION_HEADER]);
    request.headers[CORRELATION_HEADER] = correlationId;
    void reply.header(CORRELATION_HEADER, correlationId);
    // API responses are personal and never cacheable (README §116).
    void reply.header('cache-control', 'no-store');
    void reply.header('x-content-type-options', 'nosniff');
    void reply.header('referrer-policy', 'no-referrer');

    const decision = requestLimiter.check(request.ip);
    if (!decision.allowed) {
      const mapped = mapError(
        new FinchHttpError('FINCH_RATE_LIMIT_REQUESTS', 'Too many requests. Please slow down.'),
      );
      await reply
        .header('retry-after', String(decision.retryAfterSeconds))
        .status(mapped.status)
        .send({ error: { code: mapped.code, message: mapped.message, correlationId } });
    }
  });

  // On shutdown: let queued audit writes land, then release the pool we opened.
  fastify.addHook('onClose', async () => {
    await dbSink?.flush();
    if (ownsDatabase) await database?.close();
  });

  app.useGlobalFilters(new FinchExceptionFilter());
  app.enableShutdownHooks();
  return app;
}
