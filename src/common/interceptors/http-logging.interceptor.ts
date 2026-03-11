import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request, Response } from 'express';
import { AppLogger } from '../logger/app.logger';

@Injectable()
export class HttpLoggingInterceptor implements NestInterceptor {
  private readonly logger = new AppLogger('HTTP');

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const httpCtx = context.switchToHttp();
    const request = httpCtx.getRequest<Request>();
    const { method, originalUrl, ip, headers } = request;

    const requestId: string = (request as any).requestId ?? '-';
    const userAgent = headers['user-agent'] ?? '-';
    const now = Date.now();

    return next.handle().pipe(
      tap({
        next: () => {
          const response = httpCtx.getResponse<Response>();
          const duration = Date.now() - now;
          const statusCode = response.statusCode;
          const user = (request as any).user;

          this.logger.structured('log', {
            context: 'HTTP',
            message: `← ${method} ${originalUrl} | ${statusCode} | ${duration}ms`,
            method,
            url: originalUrl,
            statusCode,
            duration,
            requestId,
            ip,
            userAgent,
            userId: user?.sub ?? null,
            userRole: user?.role ?? null,
          });
        },
        error: (error: any) => {
          const duration = Date.now() - now;
          const statusCode = error?.status ?? error?.getStatus?.() ?? 500;
          const user = (request as any).user;

          this.logger.structured('error', {
            context: 'HTTP',
            message: `← ${method} ${originalUrl} | ${statusCode} | ${duration}ms | ${error.message ?? 'Unknown error'}`,
            method,
            url: originalUrl,
            statusCode,
            duration,
            requestId,
            ip,
            userAgent,
            userId: user?.sub ?? null,
            userRole: user?.role ?? null,
            error: error.message,
          });
        },
      }),
    );
  }
}
