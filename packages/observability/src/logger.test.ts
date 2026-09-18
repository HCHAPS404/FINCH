/**
 * Structured logger tests — README §46, §12.
 *
 * The redaction tests are the point of this file: a config object or a provider
 * payload spread into a log line is one of the most common ways a secret or an
 * account number reaches a place it should never be (see @finch/config's own
 * redaction tests for the same concern applied to startup configuration).
 */
import { describe, it, expect } from 'vitest';
import { Writable } from 'node:stream';
import { createLogger, withCorrelation } from './logger.js';

function captureStream(): { stream: Writable; lines: string[] } {
  const lines: string[] = [];
  const stream = new Writable({
    write(chunk: Buffer, _encoding, callback) {
      lines.push(chunk.toString());
      callback();
    },
  });
  return { stream, lines };
}

function parseLine(line: string | undefined): Record<string, unknown> {
  return JSON.parse(line ?? '{}') as Record<string, unknown>;
}

describe('createLogger', () => {
  it('emits structured JSON lines carrying the configured service name', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ serviceName: 'finch-test', logLevel: 'info' }, stream);
    logger.info({ event: 'test' }, 'hello');
    expect(lines).toHaveLength(1);
    const parsed = parseLine(lines[0]);
    expect(parsed['service']).toBe('finch-test');
    expect(parsed['msg']).toBe('hello');
  });

  it('never logs a redacted field in the clear (README §46, §12)', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ serviceName: 'finch-test', logLevel: 'info' }, stream);
    logger.info({ token: 'secret-value', accountNumber: '0000111122223333' }, 'sensitive');
    const parsed = parseLine(lines[0]);
    expect(parsed['token']).toBe('[REDACTED]');
    expect(parsed['accountNumber']).toBe('[REDACTED]');
    expect(JSON.stringify(parsed)).not.toContain('secret-value');
  });

  it('redacts a sensitive field nested one level deep', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ serviceName: 'finch-test', logLevel: 'info' }, stream);
    logger.info({ provider: { accessToken: 'secret-value' } }, 'nested');
    const parsed = parseLine(lines[0]);
    const provider = parsed['provider'] as Record<string, unknown>;
    expect(provider['accessToken']).toBe('[REDACTED]');
  });

  it('drops a line below the configured level', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ serviceName: 'finch-test', logLevel: 'warn' }, stream);
    logger.info('should not appear');
    expect(lines).toHaveLength(0);
  });
});

describe('withCorrelation', () => {
  it('attaches correlationId, causationId and traceId to every subsequent line', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ serviceName: 'finch-test', logLevel: 'info' }, stream);
    const scoped = withCorrelation(logger, {
      correlationId: 'corr-1',
      causationId: 'cause-1',
      traceId: 'trace-1',
    });
    scoped.info('scoped line');
    const parsed = parseLine(lines[0]);
    expect(parsed['correlationId']).toBe('corr-1');
    expect(parsed['causationId']).toBe('cause-1');
    expect(parsed['traceId']).toBe('trace-1');
  });

  it('defaults causationId to null when the operation has no cause', () => {
    const { stream, lines } = captureStream();
    const logger = createLogger({ serviceName: 'finch-test', logLevel: 'info' }, stream);
    const scoped = withCorrelation(logger, { correlationId: 'corr-1' });
    scoped.info('first event of an operation');
    const parsed = parseLine(lines[0]);
    expect(parsed['causationId']).toBeNull();
  });
});
