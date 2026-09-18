/**
 * OpenTelemetry bootstrap — README §3.8, §46, ADR-0024.
 *
 * Traces and metrics only. Structured logs go through `logger.ts`, not OTel Logs,
 * because the OpenTelemetry JS Logs API is still under active development — ADR-0024
 * chose not to depend on it.
 *
 * With `otelEnabled: false` or no configured endpoint, telemetry prints to the console
 * instead of nowhere: README §102.17 requires an OTel trace to be visible without
 * standing up a collector, and the local Docker Compose stays Postgres-only until an
 * ADR justifies more (`infra/docker/compose.yaml`).
 *
 * Bootstrap failure never fails the process — README §46's "telemetry failure never
 * fails a request" invariant would otherwise be undone by the one thing that's
 * supposed to observe failures.
 */
import { trace } from '@opentelemetry/api';
import { NodeSDK } from '@opentelemetry/sdk-node';
import {
  ConsoleSpanExporter,
  SimpleSpanProcessor,
  BatchSpanProcessor,
  type SpanExporter,
  type SpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import {
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
  type PushMetricExporter,
} from '@opentelemetry/sdk-metrics';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { OTLPMetricExporter } from '@opentelemetry/exporter-metrics-otlp-http';
import type { Logger } from 'pino';

export interface ObservabilityConfig {
  readonly serviceName: string;
  readonly otelEnabled: boolean;
  readonly otelExporterOtlpEndpoint?: string;
}

export interface ObservabilityHandle {
  shutdown(): Promise<void>;
}

function buildTraceExporter(config: ObservabilityConfig): {
  exporter: SpanExporter;
  processor: SpanProcessor;
} {
  if (config.otelEnabled && config.otelExporterOtlpEndpoint !== undefined) {
    const exporter = new OTLPTraceExporter({ url: `${config.otelExporterOtlpEndpoint}/v1/traces` });
    return { exporter, processor: new BatchSpanProcessor(exporter) };
  }
  const exporter = new ConsoleSpanExporter();
  // Simple (unbatched) so a locally printed span appears immediately — there is no
  // production traffic volume to batch for in this mode.
  return { exporter, processor: new SimpleSpanProcessor(exporter) };
}

function buildMetricExporter(config: ObservabilityConfig): PushMetricExporter {
  if (config.otelEnabled && config.otelExporterOtlpEndpoint !== undefined) {
    return new OTLPMetricExporter({ url: `${config.otelExporterOtlpEndpoint}/v1/metrics` });
  }
  return new ConsoleMetricExporter();
}

/**
 * Starts the OpenTelemetry SDK. Call once per process, at the composition root, before
 * any code that might create a span.
 */
export function bootstrapObservability(
  config: ObservabilityConfig,
  logger: Logger,
): ObservabilityHandle {
  const { processor } = buildTraceExporter(config);
  const metricExporter = buildMetricExporter(config);
  const useOtlp = config.otelEnabled && config.otelExporterOtlpEndpoint !== undefined;

  const sdk = new NodeSDK({
    serviceName: config.serviceName,
    spanProcessors: [processor],
    metricReaders: [
      new PeriodicExportingMetricReader({
        exporter: metricExporter,
        exportIntervalMillis: useOtlp ? 60_000 : 5_000,
      }),
    ],
  });

  try {
    sdk.start();
  } catch (error) {
    logger.warn({ err: error }, 'Failed to start OpenTelemetry SDK; continuing without it');
  }

  return {
    async shutdown() {
      try {
        await sdk.shutdown();
      } catch (error) {
        logger.warn({ err: error }, 'Error during OpenTelemetry SDK shutdown');
      }
    },
  };
}

/** The W3C trace id of the currently active span, if any (README §46 propagation). */
export function activeTraceId(): string | undefined {
  return trace.getActiveSpan()?.spanContext().traceId;
}
