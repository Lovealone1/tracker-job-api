import { Injectable, NestMiddleware } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Request, Response, NextFunction } from 'express';

export const REQUEST_ID_HEADER = 'x-request-id';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction): void {
    const requestId =
      (req.headers[REQUEST_ID_HEADER] as string) || randomUUID();

    // Attach to request for downstream access
    (req as any).requestId = requestId;

    // Echo back in response header for client-side tracing
    res.setHeader(REQUEST_ID_HEADER, requestId);

    next();
  }
}
