import { Injectable } from '@nestjs/common';
import { Request } from 'express';
import * as winston from 'winston';

interface ServiceError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}

@Injectable()
export class LoggerService {
  private logger: winston.Logger;
  constructor() {
    this.logger = winston.createLogger({
      level: 'info',
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
        winston.format.colorize(),
        winston.format.ms(),
        winston.format.label(),
      ),
      defaultMeta: {
        service: 'api-gateway',
      },
      transports: [
        new winston.transports.File({
          filename: 'logs/error.log',
          level: 'error',
        }),
        new winston.transports.File({
          filename: 'logs/combined.log',
        }),
      ],
    });

    if (process.env.NODE_ENV !== 'production') {
      this.logger.add(
        new winston.transports.Console({
          format: winston.format.combine(
            winston.format.colorize(),
            winston.format.simple(),
          ),
        }),
      );
    }
  }

  logRequest(service: string, req: Request, correlationId: string) {
    this.logger.info('Incoming Request', {
      service,
      correlationId,
      method: req.method,
      path: req.path,
      clientIp: req.ip,
      headers: req.headers,
    });
  }

  logError(service: string, error: ServiceError, correlationId: string) {
    this.logger.error('Service Error', {
      service,
      correlationId,
      error: error.message,
      code: error.code,
      statusCode: error.statusCode,
      stack: error.stack,
      details: error.details,
    });
  }
}
