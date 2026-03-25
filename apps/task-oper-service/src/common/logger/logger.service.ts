import { Injectable } from '@nestjs/common';
import winston from 'winston';
import 'winston-daily-rotate-file';

@Injectable()
export class LoggerService implements LoggerService {
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
      defaultMeta: { service: 'auth-service' },
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

  log(message: any, context?: string) {
    this.logger.info(message, { context });
  }

  error(message: any, stack?: string, context?: string) {
    // If the message is actually an object (Error object), handle it gracefully
    if (message instanceof Error) {
      this.logger.error(message.message, { stack: message.stack, context });
    } else {
      this.logger.error(message, { stack, context });
    }
  }

  warn(message: any, context?: string) {
    this.logger.warn(message, { context });
  }

  debug(message: any, context?: string) {
    this.logger.debug(message, { context });
  }

  verbose(message: any, context?: string) {
    this.logger.verbose(message, { context });
  }
}
