import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomErrorResponseDto } from '../dto/error-response.dto.js';
import { AppException } from '../exceptions/app.exception.js';
import { LoggerService } from '../logger/logger.service.js';

// ✅ Define a type for the expected object structure from HttpException
interface HttpExceptionResponse {
  message: string;
  [key: string]: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {}

  // ✅ Create a private type guard to safely check the structure of an object
  private isHttpExceptionResponse(obj: unknown): obj is HttpExceptionResponse {
    return typeof obj === 'object' && obj !== null && 'message' in obj;
  }

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status: HttpStatus;
    let message: string;
    let errorCode: string;

    // 1. Handle our specific, structured custom exceptions first
    if (exception instanceof AppException) {
      status = exception.getStatus();
      message = exception.message;
      errorCode = exception.errorCode;

      this.loggerService.warn(
        `[AppException] | ${errorCode} | ${message}`,
        'GlobalExceptionFilter'
      );
    }
    // 2. Handle standard NestJS HTTP exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (this.isHttpExceptionResponse(errorResponse)) {
        message = errorResponse.message;
      } else {
        message = 'An error occurred';
      }

      errorCode = exception.constructor.name
        .replace('Exception', '')
        .toUpperCase();

      this.loggerService.warn(
        `[HttpException] | ${status} | ${message}`,
        'GlobalExceptionFilter'
      );
    }
    // 3. Handle all other unexpected errors
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected internal server error occurred';
      errorCode = 'INTERNAL_SERVER_ERROR';

      // ✅ Use our smart error logger which unrolls nested causes
      this.loggerService.error(
        `[UnhandledException] | ${message}`,
        exception as Error,
        'GlobalExceptionFilter'
      );
    }

    const errorDto = new CustomErrorResponseDto(
      status,
      request.url,
      message,
      errorCode
    );

    response.status(status).json(errorDto);
  }
}
