/**
 * Routes NestJS's own framework logs ("Nest application successfully started", ...)
 * through the same structured pino logger as everything else, instead of Nest's
 * default console formatter.
 */
import type { LoggerService } from '@nestjs/common';
import type { Logger as PinoLogger } from 'pino';

export class NestPinoLogger implements LoggerService {
  constructor(private readonly logger: PinoLogger) {}

  log(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.info({ optionalParams }, String(message));
  }

  error(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.error({ optionalParams }, String(message));
  }

  warn(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.warn({ optionalParams }, String(message));
  }

  debug(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.debug({ optionalParams }, String(message));
  }

  verbose(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.trace({ optionalParams }, String(message));
  }

  fatal(message: unknown, ...optionalParams: unknown[]): void {
    this.logger.fatal({ optionalParams }, String(message));
  }
}
