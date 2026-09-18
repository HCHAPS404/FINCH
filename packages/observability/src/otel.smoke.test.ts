/**
 * OTel visibility smoke test — README §102.17 ("OTel trace visible").
 *
 * Boots the SDK exactly as `otelEnabled: false` configures it in local dev, creates a
 * span, and asserts it was actually printed to the console — proving the acceptance
 * criterion is met without needing a running collector or a real API request.
 */
import { describe, it, expect, vi } from 'vitest';
import { Writable } from 'node:stream';
import { trace } from '@opentelemetry/api';
import { bootstrapObservability, activeTraceId } from './otel.js';
import { createLogger } from './logger.js';

function silentLogger() {
  return createLogger(
    { serviceName: 'finch-smoke', logLevel: 'silent' },
    new Writable({
      write(_chunk, _encoding, callback) {
        callback();
      },
    }),
  );
}

describe('bootstrapObservability — console mode', () => {
  it('prints a span to the console when OTel is not enabled', async () => {
    const dirSpy = vi.spyOn(console, 'dir').mockImplementation(() => undefined);
    const handle = bootstrapObservability(
      { serviceName: 'finch-smoke', otelEnabled: false },
      silentLogger(),
    );

    const tracer = trace.getTracer('finch-smoke');
    const span = tracer.startSpan('smoke-span');
    span.end();

    await handle.shutdown();

    const printedSpan = dirSpy.mock.calls
      .map(([info]) => info as { name?: string; traceId?: string } | undefined)
      .find((info) => info?.name === 'smoke-span');

    expect(printedSpan).toBeDefined();
    expect(printedSpan?.traceId).toHaveLength(32);

    dirSpy.mockRestore();
  });

  it('exposes the active span trace id once the SDK has registered a context manager', async () => {
    const handle = bootstrapObservability(
      { serviceName: 'finch-smoke', otelEnabled: false },
      silentLogger(),
    );

    const tracer = trace.getTracer('finch-smoke');
    tracer.startActiveSpan('active-span', (span) => {
      expect(activeTraceId()).toHaveLength(32);
      span.end();
    });

    await handle.shutdown();
  });
});
