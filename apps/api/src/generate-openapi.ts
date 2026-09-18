/**
 * `pnpm openapi:generate` — README §102.5. Builds the full Nest module graph (so every
 * decorated route is registered) without binding a port or requiring a live database
 * connection, and writes the resulting document to `openapi.json`.
 */
import 'reflect-metadata';
import { writeFile } from 'node:fs/promises';
import { NestFactory } from '@nestjs/core';
import { FastifyAdapter, type NestFastifyApplication } from '@nestjs/platform-fastify';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { loadConfig } from '@finch/config';
import { createDbClient } from '@finch/db';
import { AppModule } from './app.module.js';

async function main(): Promise<void> {
  const config = loadConfig(process.env);
  const dbHandle = createDbClient(config.secrets.databaseUrl);

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule.forRoot(config, dbHandle),
    new FastifyAdapter(),
    { logger: false },
  );

  const document = SwaggerModule.createDocument(
    app,
    new DocumentBuilder().setTitle('FINCH API').setVersion('0.0.0').build(),
  );

  await writeFile(
    new URL('../openapi.json', import.meta.url),
    JSON.stringify(document, null, 2) + '\n',
  );

  await app.close();
  await dbHandle.close();
}

void main();
