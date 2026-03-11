import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AppLogger } from '../logger/app.logger';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new AppLogger('ExceptionFilter');
  private readonly isProduction = process.env.NODE_ENV === 'production';

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
        : null;

    const message =
      typeof errorResponse === 'string'
        ? errorResponse
        : typeof errorResponse === 'object' && errorResponse !== null
          ? (errorResponse as any).message ?? 'Internal server error'
          : 'Internal server error';

    const requestId: string = (request as any).requestId ?? '-';
    const user = (request as any).user;
    const stack = exception instanceof Error ? exception.stack : undefined;

    // Log the error with full context
    this.logger.structured('error', {
      context: 'ExceptionFilter',
      message: `${request.method} ${request.originalUrl} → ${status}`,
      method: request.method,
      url: request.originalUrl,
      statusCode: status,
      requestId,
      userId: user?.sub ?? null,
      error: exception instanceof Error ? exception.message : String(exception),
      // Stack trace only in dev — never leak to prod logs for PII/security
      ...(this.isProduction ? {} : { stack }),
    });

    // Return sanitized error response to client
    response.status(status).json({
      statusCode: status,
      message: this.isProduction && status >= 500 ? 'Internal server error' : message,
      timestamp: new Date().toISOString(),
      path: request.originalUrl,
      requestId,
    });
  }
}
