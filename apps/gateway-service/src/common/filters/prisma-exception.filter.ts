import { ArgumentsHost, Catch, HttpStatus, Injectable } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';
import { CustomErrorResponseDto } from '../dto/error-response.dto';
import { LoggerService } from '../log/logger.service';

interface ServiceError extends Error {
  statusCode?: number;
  code?: string;
  details?: unknown;
}
@Injectable()
@Catch(Prisma.PrismaClientKnownRequestError)
/** Handles Prisma Client known request errors
 *  Maps Prisma error codes to HTTP response statuses and messages.
 *  This filter catches specific Prisma errors and formats them into a user-friendly JSON response.
 */
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly logger: LoggerService) {
    super();
  }

  private toServiceError(
    exception: Prisma.PrismaClientKnownRequestError,
    status: number
  ): ServiceError {
    return {
      name: 'PrismaError',
      message: exception.message,
      statusCode: status,
      code: exception.code,
      details: {
        meta: exception.meta,
        target: exception.meta?.target,
      },
      stack: exception.stack,
    };
  }

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const message = exception.message.replace(/\n/g, '');
    const correlationId = request.headers['x-correlation-id'] as string;

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'An unexpected database error occured.';

    /**
     * Handle specific Prisma error codes and map them to HTTP response statuses.
     * This filter catches specific Prisma errors and formats them into a user-friendly JSON response.
     * Error codes list: P2000, P2001, P2002, P2003, P2005, P2006, P2007, P2011, P2018, P2019, P2025, P2028, P2034
     */
    switch (exception.code) {
      // --- 409 Conflict: Unique constraint violation ---
      case 'P2002': {
        status = HttpStatus.CONFLICT;
        const target = (exception.meta?.target as string[])?.join(', ');
        errorMessage = `A record with this value for '${target}' already exists.`;
        break;
      }
      // --- 404 Not Found: Record does not exist ---
      case 'P2001': // Record searched for in a `where` condition does not exist
      case 'P2018': // The required connected records were not found
      case 'P2025': {
        // An operation failed because a required record was not found
        status = HttpStatus.NOT_FOUND;
        errorMessage =
          'The requested resource or a related one could not be found.';
        break;
      }

      // --- 400 Bad Request: Invalid data or relations ---
      case 'P2000': // Value too long for column
      case 'P2005': // Invalid value stored in DB for a field
      case 'P2006': // Invalid value provided for a field
      case 'P2007': // Data validation error
      case 'P2011': {
        // Null constraint violation
        status = HttpStatus.BAD_REQUEST;
        errorMessage =
          'The data provided for the operation was invalid, incomplete, or of the wrong type.';
        break;
      }

      case 'P2003': {
        // Foreign key constraint failed
        status = HttpStatus.BAD_REQUEST;
        const fieldName = exception.meta?.field_name as string;
        errorMessage = `The operation failed because a related record on field '${fieldName}' does not exist.`;
        break;
      }
      // --- 409 Conflict: Transaction and other write errors ---
      case 'P2019': // Input error (e.g., trying to connect records that don't exist)
      case 'P2034': {
        // Transaction conflict: a write conflicts with a previous write.
        status = HttpStatus.CONFLICT;
        errorMessage =
          'The operation could not be completed due to a data conflict. Please try again.';
        break;
      }
      // --- 503 Service Unavailable: Transaction API errors ---
      case 'P2028': {
        // Transaction API error (e.g., transaction timed out)
        status = HttpStatus.SERVICE_UNAVAILABLE;
        errorMessage =
          'The database service is temporarily unavailable or timed out. Please try again later.';
        break;
      }

      default: {
        console.log(
          '--------------------Error at Prisma Exception--------------------'
        );
        console.log(`${exception.code}: ${exception.message}`);
        console.log(message);
        console.log(
          '--------------------Error at Prisma Exception--------------------'
        );
        console.error(exception);
        console.log(
          '----------------END OF Error at Prisma Exception-----------------'
        );
        break;
      }
    }

    this.logger.logError(
      'prisma',
      this.toServiceError(exception, status),
      correlationId
    );

    response
      .status(status)
      .json(new CustomErrorResponseDto(status, request.url, errorMessage));
  }
}
