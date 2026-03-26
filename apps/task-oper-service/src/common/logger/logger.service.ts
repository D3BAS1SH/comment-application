import { Injectable, LoggerService as NestLoggerService } from '@nestjs/common';
import winston from 'winston';
import 'winston-daily-rotate-file';
import { TraceContext } from './trace.context';

@Injectable()
export class LoggerService implements NestLoggerService {
  private logger: winston.Logger;
  constructor() {
    const { json, timestamp, errors, combine, printf, colorize } =
      winston.format;
    const devFormat = printf((info) => {
      const { level, message, timestamp, context, stack, ...meta } =
        info as winston.Logform.TransformableInfo & {
          timestamp?: string;
          context?: string | object;
          stack?: string;
        };
      const ctx = context
        ? `[${typeof context === 'object' ? JSON.stringify(context) : context}] `
        : '';
      const metaString = Object.keys(meta).length ? JSON.stringify(meta) : '';
      const stackString = stack ? `\n${stack}` : '';
      return `${timestamp} ${level}: ${ctx}${message as string} ${metaString}${stackString}`;
    });

    const transports: winston.transport[] = [
      new winston.transports.Console({
        format:
          process.env.NODE_ENV === 'production'
            ? combine(timestamp(), json())
            : combine(
                colorize(),
                timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
                devFormat
              ),
      }),

      // File Transport: Daily Rotation for ALL logs
      new winston.transports.DailyRotateFile({
        filename: 'logs/application-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        format: combine(timestamp(), json()),
      }),

      // File Transport: Daily Rotation for ERROR logs only (separating errors is good practice)
      new winston.transports.DailyRotateFile({
        filename: 'logs/error-%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '14d',
        level: 'error',
        format: combine(timestamp(), errors({ stack: true }), json()),
      }),
    ];

    this.logger = winston.createLogger({
      level: process.env.LOG_LEVEL || 'info',
      format: combine(timestamp(), errors({ stack: true }), json()),
      defaultMeta: { service: 'task-oper-service' },
      transports: transports,
      exceptionHandlers: [
        new winston.transports.DailyRotateFile({
          filename: 'exceptions-%DATE%.log',
          dirname: 'logs',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxFiles: '14d',
          maxSize: '20m',
        }),
      ],
      rejectionHandlers: [
        new winston.transports.DailyRotateFile({
          filename: 'rejections-%DATE%.log',
          dirname: 'logs',
          datePattern: 'YYYY-MM-DD',
          zippedArchive: true,
          maxFiles: '14d',
          maxSize: '20m',
        }),
      ],
    });
  }

  log(message: string | Record<string, unknown>, context?: string) {
    const cleanMessage = this.redact(message);
    this.logger.info(
      typeof cleanMessage === 'string'
        ? cleanMessage
        : JSON.stringify(cleanMessage),
      { context, traceId: TraceContext.getTraceId() }
    );
  }

  error(
    message: string | Record<string, unknown> | Error,
    stack?: string | Error | any,
    context?: string
  ) {
    const traceId = TraceContext.getTraceId();

    if (message instanceof Error) {
      const errorData = this.extractErrorData(message);
      this.logger.error(errorData.message, {
        ...errorData,
        context: (stack as string) || context,
        traceId,
      });
    } else if (stack instanceof Error) {
      const errorData = this.extractErrorData(stack);
      this.logger.error(
        typeof message === 'string' ? message : errorData.message,
        {
          ...errorData,
          context,
          traceId,
        }
      );
    } else {
      const cleanMessage = this.redact(message);
      this.logger.error(
        typeof cleanMessage === 'string'
          ? cleanMessage
          : JSON.stringify(cleanMessage),
        { stack, context, traceId }
      );
    }
  }

  fatal(message: string | Record<string, unknown> | Error, context?: string) {
    // In many professional setups, fatal is treated as a high-priority error
    this.error(message, undefined, context);
  }

  warn(message: string | Record<string, unknown>, context?: string) {
    const cleanMessage = this.redact(message);
    this.logger.warn(
      typeof cleanMessage === 'string'
        ? cleanMessage
        : JSON.stringify(cleanMessage),
      { context, traceId: TraceContext.getTraceId() }
    );
  }

  debug(message: string | Record<string, unknown>, context?: string) {
    const cleanMessage = this.redact(message);
    this.logger.debug(
      typeof cleanMessage === 'string'
        ? cleanMessage
        : JSON.stringify(cleanMessage),
      { context, traceId: TraceContext.getTraceId() }
    );
  }

  verbose(message: string | Record<string, unknown>, context?: string) {
    const cleanMessage = this.redact(message);
    this.logger.verbose(
      typeof cleanMessage === 'string'
        ? cleanMessage
        : JSON.stringify(cleanMessage),
      { context, traceId: TraceContext.getTraceId() }
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private extractErrorData(error: any): any {
    if (!(error instanceof Error)) return error;

    return {
      message: error.message,
      stack: error.stack,
      // Extract nested cause (ES2022 standard)
      cause:
        (error as any).cause instanceof Error
          ? this.extractErrorData((error as any).cause)
          : (error as any).cause,
      // Capture Prisma specific metadata if it exists
      ...((error as any).code && { code: (error as any).code }),
      ...((error as any).meta && { meta: (error as any).meta }),
    };
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private redact(data: any): any {
    if (!data || typeof data !== 'object') return data;
    const isArray = Array.isArray(data);
    const copy = isArray ? [...data] : { ...data };

    const keysToRedact = [
      'password',
      'token',
      'secret',
      'key',
      'auth',
      'credential',
      'pass',
      'pwd',
      'authorization',
      'cookie',
      'ssn',
      'credit_card',
    ];

    for (const key in copy) {
      if (keysToRedact.includes(key.toLowerCase())) {
        copy[key] = '[REDACTED]';
      } else if (copy[key] && typeof copy[key] === 'object') {
        copy[key] = this.redact(copy[key]); // This is the magic recursion
      }
    }

    return copy;
  }
}
