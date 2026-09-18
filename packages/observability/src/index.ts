/**
 * @finch/observability — structured logging, correlation and OpenTelemetry bootstrap.
 * README §46, §3.8, ADR-0024.
 */
export type { LoggerConfig } from './logger.js';
export { createLogger, withCorrelation } from './logger.js';

export type { CorrelationContext } from './correlation.js';
export { newCorrelationId, runWithCorrelation, getCorrelationContext } from './correlation.js';

export type { ObservabilityConfig, ObservabilityHandle } from './otel.js';
export { bootstrapObservability, activeTraceId } from './otel.js';
