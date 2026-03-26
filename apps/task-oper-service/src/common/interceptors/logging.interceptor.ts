import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { LoggerService } from '../logger/logger.service';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly loggerService: LoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<Request>();
    const { method, url } = req;

    const startTime = Date.now();

    this.loggerService.log(`[REQUEST] ${method} ${url}`, 'Logging Interceptor');

    return next.handle().pipe(
      tap(() => {
        const timeTaken = Date.now() - startTime;
        this.loggerService.log(
          `[RESPONSE] ${method} ${url} - ${timeTaken}ms`,
          'Logging Interceptor'
        );
      })
    );
  }
}
