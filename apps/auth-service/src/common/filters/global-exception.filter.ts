import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomErrorResponseDto } from '../dto/error-response.dto';
import { AppException } from '../exceptions/app.exception';

// ✅ Define a type for the expected object structure from HttpException
interface HttpExceptionResponse {
  message: string;
  [key: string]: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

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
      // ✅ The Fix: Access properties directly from the typed exception. It's safer.
      message = exception.message;
      errorCode = exception.errorCode;

      this.logger.warn(`[AppException] | ${errorCode} | ${message}`, {
        path: request.url,
        details: exception.details,
      });
    }
    // 2. Handle standard NestJS HTTP exceptions
    else if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      // ✅ The Fix: Use the type guard to safely determine the response shape
      if (typeof errorResponse === 'string') {
        message = errorResponse;
      } else if (this.isHttpExceptionResponse(errorResponse)) {
        // TypeScript now knows errorResponse has a .message property
        message = errorResponse.message;
      } else {
        // Fallback for unexpected object shapes
        message = 'An error occurred';
      }

      errorCode = exception.constructor.name
        .replace('Exception', '')
        .toUpperCase();

      this.logger.warn(`[HttpException] | ${status} | ${message}`, {
        path: request.url,
      });
    }
    // 3. Handle all other unexpected errors
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'An unexpected internal server error occurred';
      errorCode = 'INTERNAL_SERVER_ERROR';

      this.logger.error(`[UnhandledException] | ${message}`, exception);
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
