import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { uuidv7 } from 'uuidv7';
import { TraceContext } from './trace.context';

@Injectable()
export class TraceMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    const traceId = (req.headers['x-request-id'] as string) || uuidv7();

    // Ensure the client knows their trace ID
    res.setHeader('x-request-id', traceId);

    // Run the request inside the TraceContext "pocket"
    TraceContext.run(traceId, next);
  }
}
