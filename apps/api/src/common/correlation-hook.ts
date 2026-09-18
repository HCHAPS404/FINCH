/**
 * Correlation propagation — README §46, §121 ("every response carries a correlation
 * id"). Runs as the very first Fastify hook so the correlation id is available to
 * every log line, exception, and outbox write the request produces.
 *
 * `done()` must be called synchronously inside `runWithCorrelation`'s callback — that
 * is what keeps the rest of the request lifecycle (routing, guards, the handler)
 * running inside the same `AsyncLocalStorage` scope. Awaiting first and calling
 * `done()` afterwards would let the context end before the handler ever runs.
 */
import type { FastifyRequest, FastifyReply, HookHandlerDoneFunction } from 'fastify';
import { newCorrelationId, runWithCorrelation } from '@finch/observability';

const CORRELATION_HEADER = 'x-correlation-id';

export function correlationHook(
  request: FastifyRequest,
  reply: FastifyReply,
  done: HookHandlerDoneFunction,
): void {
  const incoming = request.headers[CORRELATION_HEADER];
  const correlationId =
    typeof incoming === 'string' && incoming.length > 0 ? incoming : newCorrelationId();

  void reply.header(CORRELATION_HEADER, correlationId);

  runWithCorrelation({ correlationId, causationId: null }, () => {
    done();
  });
}

export { CORRELATION_HEADER };
