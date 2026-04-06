import { ArgumentsHost, Catch, HttpStatus, Injectable } from '@nestjs/common';
import { BaseExceptionFilter } from '@nestjs/core';
import { Prisma } from '../../prisma/generated/client.js';
import { Request, Response } from 'express';
import { CustomErrorResponseDto } from '../dto/error-response.dto.js';
import { LoggerService } from '../logger/logger.service.js';

@Injectable()
@Catch(Prisma.PrismaClientKnownRequestError)
/** Handles Prisma Client known request errors
 *  Maps Prisma error codes to HTTP response statuses and messages.
 *  This filter catches specific Prisma errors and formats them into a user-friendly JSON response.
 */
export class PrismaClientExceptionFilter extends BaseExceptionFilter {
  constructor(private readonly loggerService: LoggerService) {
    super();
  }

  catch(
    exception: Prisma.PrismaClientKnownRequestError,
    host: ArgumentsHost
  ): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let errorMessage = 'An unexpected database error occured.';

    /**
     * Handle specific Prisma error codes and map them to HTTP response statuses.
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
      case 'P2001':
      case 'P2018':
      case 'P2025': {
        status = HttpStatus.NOT_FOUND;
        errorMessage =
          'The requested resource or a related one could not be found.';
        break;
      }

      // --- 400 Bad Request: Invalid data or relations ---
      case 'P2000':
      case 'P2005':
      case 'P2006':
      case 'P2007':
      case 'P2011': {
        status = HttpStatus.BAD_REQUEST;
        errorMessage =
          'The data provided for the operation was invalid, incomplete, or of the wrong type.';
        break;
      }

      case 'P2003': {
        status = HttpStatus.BAD_REQUEST;
        const fieldName = exception.meta?.field_name as string;
        errorMessage = `The operation failed because a related record on field '${fieldName}' does not exist.`;
        break;
      }

      // --- 409 Conflict: Transaction and other write errors ---
      case 'P2019':
      case 'P2034': {
        status = HttpStatus.CONFLICT;
        errorMessage =
          'The operation could not be completed due to a data conflict. Please try again.';
        break;
      }

      // --- 503 Service Unavailable: Transaction API errors ---
      case 'P2028': {
        status = HttpStatus.SERVICE_UNAVAILABLE;
        errorMessage =
          'The database service is temporarily unavailable or timed out. Please try again later.';
        break;
      }

      default: {
        break;
      }
    }

    // ✅ Use our smart logger to log the Prisma error with TraceID and metadata
    this.loggerService.error(
      `[PrismaException] | ${exception.code} | ${errorMessage}`,
      exception,
      'PrismaClientExceptionFilter'
    );

    response
      .status(status)
      .json(new CustomErrorResponseDto(status, request.url, errorMessage));
  }
}
