import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { loadConfig } from '@finch/config';
import { createLogger, bootstrapObservability } from '@finch/observability';
import { createDbClient } from '@finch/db';
import { AppModule } from './app.module.js';
import { FinchExceptionFilter } from './common/filters/finch-exception.filter.js';
import { correlationHook } from './common/correlation-hook.js';
import { NestPinoLogger } from './infrastructure/observability/nest-pino-logger.js';

async function bootstrap(): Promise<void> {
  const config = loadConfig(process.env);

  const logger = createLogger({
    serviceName: config.observability.otelServiceName,
    logLevel: config.observability.logLevel,
  });

  const observability = bootstrapObservability(
    {
      serviceName: config.observability.otelServiceName,
      otelEnabled: config.observability.otelEnabled,
      ...(config.observability.otelExporterOtlpEndpoint !== undefined
        ? { otelExporterOtlpEndpoint: config.observability.otelExporterOtlpEndpoint }
        : {}),
    },
    logger,
  );

  const dbHandle = createDbClient(config.secrets.databaseUrl);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.forRoot(config, dbHandle),
    new FastifyAdapter(),
    { logger: new NestPinoLogger(logger) },
  );

  app.getHttpAdapter().getInstance().addHook('onRequest', correlationHook);
  app.useGlobalFilters(new FinchExceptionFilter());
  app.setGlobalPrefix('api/v1');

  const openApiDocument = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('FINCH API').setVersion('0.0.0').build(),
  );
  SwaggerModule.setup('api/v1/docs', app, openApiDocument);

  await app.listen(config.public.apiPort, '0.0.0.0');

  const shutdown = async (): Promise<void> => {
    await app.close();
    await dbHandle.close();
    await observability.shutdown();
    process.exit(0);
  };
  process.on('SIGTERM', () => void shutdown());
  process.on('SIGINT', () => void shutdown());
}

void bootstrap();
