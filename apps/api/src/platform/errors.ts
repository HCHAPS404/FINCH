/**
 * The one place errors become HTTP responses — README §58, §119.
 *
 * Every failure leaves the API in the stable `FinchErrorBody` shape with a correlation
 * ID. Provider text, stack traces and internal messages never reach the client.
 */
import { AiGatewayError } from '@finch/ai-core';
import {
  ERROR_NAMESPACES,
  NAMESPACE_HTTP_STATUS,
  type ErrorNamespace,
  type FinchErrorBody,
  type FinchErrorCode,
} from '@finch/contracts';
import { Catch, HttpException, type ArgumentsHost, type ExceptionFilter } from '@nestjs/common';
import type { FastifyReply, FastifyRequest } from 'fastify';
import { ZodError } from 'zod';

import { CORRELATION_HEADER } from './correlation.js';

/** A deliberate, already-classified API error (e.g. a rate-limit refusal). */
export class FinchHttpError extends Error {
  constructor(
    readonly code: FinchErrorCode,
    readonly userMessage: string,
    readonly headers: Readonly<Record<string, string>> = {},
  ) {
    super(userMessage);
    this.name = 'FinchHttpError';
  }
}

const USER_MESSAGES: Partial<Record<FinchErrorCode, string>> = {
  FINCH_PROVIDER_AI_DISABLED: 'Explanations are paused right now. Calculations are unaffected.',
  FINCH_PROVIDER_AI_UNAVAILABLE: 'The assistant is unavailable right now. Please try again later.',
  FINCH_PROVIDER_AI_TIMEOUT: 'The assistant took too long to answer. Please try again.',
  FINCH_PROVIDER_AI_RATE_LIMITED: 'The assistant is busy. Please try again in a moment.',
  FINCH_PROVIDER_AI_INVALID_RESPONSE: 'The assistant returned an unusable answer. Please retry.',
};

/**
 * Resolve the namespace by prefix, not by splitting on `_`: `RATE_LIMIT` itself
 * contains an underscore. Longest match first so a future `AUTHZ`/`AUTH`-style overlap
 * resolves to the more specific namespace.
 */
const NAMESPACES_LONGEST_FIRST = [...ERROR_NAMESPACES].sort((a, b) => b.length - a.length);

export function statusFor(code: FinchErrorCode): number {
  const namespace = NAMESPACES_LONGEST_FIRST.find((candidate: ErrorNamespace) =>
    code.startsWith(`FINCH_${candidate}_`),
  );
  return namespace === undefined ? 500 : NAMESPACE_HTTP_STATUS[namespace];
}

interface Mapped {
  readonly status: number;
  readonly code: FinchErrorCode;
  readonly message: string;
  readonly details?: FinchErrorBody['error']['details'];
  readonly headers?: Readonly<Record<string, string>>;
}

export function mapError(error: unknown): Mapped {
  if (error instanceof FinchHttpError) {
    return {
      status: statusFor(error.code),
      code: error.code,
      message: error.userMessage,
      headers: error.headers,
    };
  }
  if (error instanceof AiGatewayError) {
    return {
      status: statusFor(error.code),
      code: error.code,
      message: USER_MESSAGES[error.code] ?? 'The assistant could not answer.',
    };
  }
  if (error instanceof ZodError) {
    return {
      status: 400,
      code: 'FINCH_VALIDATION_ERROR',
      message: 'The request contains invalid data.',
      details: error.issues.map((issue) => ({
        field: issue.path.join('.') || '(body)',
        issue: issue.message,
      })),
    };
  }
  if (error instanceof HttpException) {
    const status = error.getStatus();
    if (status === 404) {
      return { status, code: 'FINCH_VALIDATION_NOT_FOUND', message: 'Not found.' };
    }
    if (status === 413) {
      return { status, code: 'FINCH_VALIDATION_TOO_LARGE', message: 'The request is too large.' };
    }
    if (status < 500) {
      return { status, code: 'FINCH_VALIDATION_ERROR', message: 'The request is invalid.' };
    }
  }
  return {
    status: 500,
    code: 'FINCH_INTERNAL_ERROR',
    message: 'Something went wrong on our side.',
  };
}

@Catch()
export class FinchExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<FastifyRequest>();
    const reply = http.getResponse<FastifyReply>();
    const correlationId = String(reply.getHeader(CORRELATION_HEADER) ?? request.id);
    const mapped = mapError(exception);

    if (mapped.status >= 500 && !(exception instanceof AiGatewayError)) {
      // The only place an unexpected error is logged; the log carries the correlation
      // ID so support can find it, and the client never sees the message.
      request.log.error({ correlationId, err: exception }, 'unhandled error');
    }

    const body: FinchErrorBody = {
      error: {
        code: mapped.code,
        message: mapped.message,
        correlationId,
        ...(mapped.details === undefined ? {} : { details: mapped.details }),
      },
    };
    void reply
      .headers(mapped.headers ?? {})
      .status(mapped.status)
      .send(body);
  }
}
