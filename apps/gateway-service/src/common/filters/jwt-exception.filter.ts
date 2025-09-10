import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { TokenExpiredError,JsonWebTokenError } from "@nestjs/jwt";
import { Request, Response } from "express";
import { CustomErrorResponseDto } from "../dto/error-response.dto";
import { LoggerService } from "../log/logger.service";

interface ServiceError extends Error {
    statusCode?: number;
    code?: string;
    details?: unknown;
}
@Injectable()
@Catch(TokenExpiredError, JsonWebTokenError)
export class JwtExceptionFilter implements ExceptionFilter {
    constructor(private readonly logger: LoggerService){}
    private toServiceError(exception: unknown): ServiceError {
        if (exception instanceof HttpException) {
            return {
                name: exception.name,
                message: exception.message,
                statusCode: exception.getStatus(),
                stack: exception.stack
            };
        }

        if (exception instanceof Error) {
            return {
                name: exception.name,
                message: exception.message,
                statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
                stack: exception.stack
            };
        }

        return {
            name: 'UnknownError',
            message: 'An unknown error occurred',
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR
        };
    }
    async catch(exception: TokenExpiredError | JsonWebTokenError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();
        const correlationId = request.headers['x-correlation-id'];

        const status = 401; // Unauthorized
        
        // In the gateway, any JWT error always means the access token is bad.
        const errorCode = exception instanceof TokenExpiredError 
        ? 'ACCESS_TOKEN_EXPIRED'
        : 'ACCESS_TOKEN_INVALID';
    
    const message = exception instanceof TokenExpiredError
        ? 'Access token has expired. Please refresh your token.'
        : 'Access token is invalid. Please login again.';

        console.error('API Gateway JWT Error:', exception.message);
        this.logger.logError('API JWT error',
            this.toServiceError(exception),
            correlationId as string
        )

        response
        .status(status)
        .json(new CustomErrorResponseDto(status, request.url, message, errorCode));
    }
}