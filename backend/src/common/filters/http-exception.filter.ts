import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * 글로벌 HTTP 예외 필터
 * 모든 HTTP 예외를 잡아서 일관된 형식으로 응답한다.
 *
 * 응답 형식:
 * ```json
 * {
 *   "statusCode": 404,
 *   "message": "사용자를 찾을 수 없습니다",
 *   "error": "Not Found",
 *   "timestamp": "2026-02-07T12:00:00.000Z",
 *   "path": "/api/v1/users/123"
 * }
 * ```
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const errorResponse =
      exception instanceof HttpException
        ? exception.getResponse()
        : { message: '서버 내부 오류가 발생했습니다' };

    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : (errorResponse as Record<string, unknown>).message ?? '알 수 없는 오류';

    const error =
      typeof errorResponse === 'string'
        ? 'Error'
        : (errorResponse as Record<string, unknown>).error ?? 'Internal Server Error';

    const responseBody = {
      statusCode: status,
      message,
      error,
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `[${request.method}] ${request.url} - ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
      );
    } else {
      this.logger.warn(
        `[${request.method}] ${request.url} - ${status}: ${JSON.stringify(message)}`,
      );
    }

    response.status(status).json(responseBody);
  }
}
