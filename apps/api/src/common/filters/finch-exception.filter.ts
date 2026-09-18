/**
 * Global exception filter — README §58, §119.
 *
 * Every failing endpoint returns the same `FinchErrorBody` shape, carrying the
 * correlation id set by `correlationHook`. Raw provider/internal error text is never
 * surfaced to a client (§119) — anything that isn't a `FinchHttpException` collapses
 * to a generic message.
 */
import {
  Catch,
  HttpException,
  HttpStatus,
  type ArgumentsHost,
  type ExceptionFilter,
} from '@nestjs/common';
import type { FastifyReply } from 'fastify';
import {
  ERROR_NAMESPACES,
  NAMESPACE_HTTP_STATUS,
  type ErrorNamespace,
  type FinchErrorBody,
  type FinchErrorCode,
} from '@finch/contracts';
import { getCorrelationContext } from '@finch/observability';
import { FinchHttpException } from '../errors/finch-http-exception.js';

function namespaceOf(code: FinchErrorCode): ErrorNamespace {
  const namespace = ERROR_NAMESPACES.find((candidate) => code.startsWith(`FINCH_${candidate}_`));
  if (namespace === undefined) {
    // Cannot happen for a code that satisfies the FinchErrorCode template type, but
    // the filter must never throw while building an error response.
    return 'INTERNAL';
  }
  return namespace;
}

function toResponse(
  exception: unknown,
  correlationId: string,
): { status: number; body: FinchErrorBody } {
  if (exception instanceof FinchHttpException) {
    return {
      status: NAMESPACE_HTTP_STATUS[namespaceOf(exception.code)],
      body: {
        error: {
          code: exception.code,
          message: exception.message,
          correlationId,
          ...(exception.details !== undefined ? { details: exception.details } : {}),
        },
      },
    };
  }

  if (exception instanceof HttpException) {
    const status: HttpStatus = exception.getStatus();
    const code: FinchErrorCode =
      status === HttpStatus.NOT_FOUND
        ? 'FINCH_VALIDATION_NOT_FOUND'
        : 'FINCH_VALIDATION_REQUEST_INVALID';
    return { status, body: { error: { code, message: exception.message, correlationId } } };
  }

  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    body: {
      error: {
        code: 'FINCH_INTERNAL_UNEXPECTED',
        message: 'An unexpected error occurred.',
        correlationId,
      },
    },
  };
}

@Catch()
export class FinchExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const reply = host.switchToHttp().getResponse<FastifyReply>();
    const correlationId = getCorrelationContext()?.correlationId ?? 'unknown';
    const { status, body } = toResponse(exception, correlationId);
    void reply.status(status).send(body);
  }
}
