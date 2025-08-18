import { ArgumentsHost, Catch, ExceptionFilter, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { TokenExpiredError,JsonWebTokenError } from "@nestjs/jwt";
import { Request, Response } from "express";
import { CustomErrorResponseDto } from "../dto/error-response.dto";

@Injectable()
@Catch(TokenExpiredError, JsonWebTokenError)
export class JwtExceptionFilter implements ExceptionFilter {
    constructor(){}
    async catch(exception: TokenExpiredError | JsonWebTokenError, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = 401; // Unauthorized
        
        // In the gateway, any JWT error always means the access token is bad.
        const errorCode = 'ACCESS_TOKEN_EXPIRED';
        const message = 'Access token is invalid or has expired. Please refresh your token.';

        console.error('API Gateway JWT Error:', exception.message);

        response
        .status(status)
        .json(new CustomErrorResponseDto(status, request.url, message, errorCode));
    }
}