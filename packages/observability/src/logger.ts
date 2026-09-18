/**
 * Structured logging — README §46.
 *
 * A JSON line per event, not a log-and-hope prose stream, so a support code (README
 * §121) or an incident responder can filter by `correlationId` and get exactly the
 * lines that matter. Redaction is a `redact` option evaluated by pino itself rather
 * than something call sites must remember, because the one invariant this file exists
 * to uphold — "tokens, full account numbers, complete documents and raw provider
 * payloads are never logged" — cannot depend on every future call site getting it
 * right by hand.
 */
import pino, { type Logger, type LoggerOptions, type DestinationStream } from 'pino';

/**
 * Field names redacted wherever they appear, one level deep from any object logged.
 * Deliberately name-based rather than an allowlist of shapes: a new call site that logs
 * a `{ token }` field is redacted automatically, without the logging package needing to
 * know that call site exists.
 */
const REDACTED_FIELD_NAMES = [
  'password',
  'token',
  'accessToken',
  'refreshToken',
  'accountNumber',
  'documentContent',
  'rawPayload',
  'authorization',
];

const REDACTED_PATHS = REDACTED_FIELD_NAMES.flatMap((field) => [field, `*.${field}`]).concat(
  'req.headers.authorization',
);

export interface LoggerConfig {
  readonly serviceName: string;
  readonly logLevel: string;
}

export function createLogger(config: LoggerConfig, destination?: DestinationStream): Logger {
  const options: LoggerOptions = {
    level: config.logLevel,
    base: { service: config.serviceName },
    redact: { paths: REDACTED_PATHS, censor: '[REDACTED]' },
    timestamp: pino.stdTimeFunctions.isoTime,
  };
  return destination ? pino(options, destination) : pino(options);
}

/**
 * A logger scoped to one request or operation, carrying the identifiers that let a
 * user-visible support code find the matching log lines (README §121) and that mirror
 * the fields README §21.2 requires on every event envelope.
 */
export function withCorrelation(
  logger: Logger,
  ids: {
    readonly correlationId: string;
    readonly causationId?: string | null;
    readonly traceId?: string;
  },
): Logger {
  return logger.child({
    correlationId: ids.correlationId,
    causationId: ids.causationId ?? null,
    traceId: ids.traceId,
  });
}
