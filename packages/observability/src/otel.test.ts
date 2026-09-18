/**
 * `activeTraceId` tests — README §46 propagation.
 *
 * Deliberately independent of `bootstrapObservability`: with no OpenTelemetry SDK
 * registered, both the global tracer provider and the global context manager are
 * true no-ops, so there is no "active span" to read even inside a span's callback.
 * See `otel.smoke.test.ts` for the case with a real SDK started, where an active span
 * does carry a readable trace id.
 */
import { describe, it, expect } from 'vitest';
import { activeTraceId } from './otel.js';

describe('activeTraceId', () => {
  it('is undefined with no OpenTelemetry SDK registered', () => {
    expect(activeTraceId()).toBeUndefined();
  });
});
