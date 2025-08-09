import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from "@nestjs/common";
import { Request, Response } from "express";
import { CustomErrorResponseDto } from "../dto/error-response.dto";

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter{
    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = exception instanceof HttpException ? (exception.getResponse() as any).message || exception.message : "An unexpected internal server error occured";

        if(status === HttpStatus.INTERNAL_SERVER_ERROR){
            console.error("Unhandled error: ",exception);
        }

        response.status(status).json(new CustomErrorResponseDto(status,request.url,message));
    }
}