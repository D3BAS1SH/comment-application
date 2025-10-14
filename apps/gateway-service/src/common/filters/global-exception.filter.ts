import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { CustomErrorResponseDto } from '../dto/error-response.dto';
import { LoggerService } from '../log/logger.service';

interface ServiceError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly logger: LoggerService) {}
  private toServiceError(exception: unknown): ServiceError {
    if (exception instanceof HttpException) {
      return {
        name: exception.name,
        message: exception.message,
        statusCode: exception.getStatus(),
        stack: exception.stack,
      };
    }

    if (exception instanceof Error) {
      return {
        name: exception.name,
        message: exception.message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
        stack: exception.stack,
      };
    }

    return {
      name: 'UnknownError',
      message: 'An unknown error occurred',
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const correlationId = request.headers['x-correlation-id'];

    const status: HttpStatus =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;
    const message =
      exception instanceof HttpException
        ? (exception.getResponse() as CustomErrorResponseDto).message ||
          exception.message
        : 'An unexpected internal server error occured';

    if (status === HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.logError(
        'Unhandled error: ',
        this.toServiceError(exception),
        correlationId as string,
      );
      console.error('Unhandled error: ', exception);
    }

    response
      .status(status)
      .json(new CustomErrorResponseDto(status, request.url, message));
  }
}
