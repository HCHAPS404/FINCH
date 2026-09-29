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
import { Module, type DynamicModule } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';

import { AssistantController } from './modules/assistant/adapters/assistant.controller.js';
import { HealthController } from './modules/health/health.controller.js';
import { CORRELATION_HEADER, resolveCorrelationId } from './platform/correlation.js';
import { FinchExceptionFilter, FinchHttpError, mapError } from './platform/errors.js';
import { FixedWindowLimiter } from './platform/rate-limit.js';
import {
  AI_GATEWAY,
  AI_TURN_LIMITER,
  BUILD_INFO,
  CONFIG,
  type BuildInfo,
} from './platform/tokens.js';

export interface AppOverrides {
  /** Replace the provider adapter (tests use a real local HTTP server instead). */
  readonly inference?: InferencePort;
  readonly audit?: AiAuditSink;
  readonly build?: BuildInfo;
}

const MINUTE_MS = 60_000;

@Module({})
class AppModule {
  static register(config: FinchConfig, overrides: AppOverrides): DynamicModule {
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
      controllers: [HealthController, AssistantController],
      providers: [
        { provide: CONFIG, useValue: config },
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
            audit: overrides.audit ?? { record: () => undefined },
          }),
        },
      ],
    };
  }
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
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.register(config, overrides),
    adapter,
    { logger: config.public.nodeEnv === 'test' ? false : ['error', 'warn', 'log'] },
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

  app.useGlobalFilters(new FinchExceptionFilter());
  app.enableShutdownHooks();
  return app;
}
