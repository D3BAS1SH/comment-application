import { ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { TokenExpiredError, JsonWebTokenError } from "@nestjs/jwt";
import { AuthGuard } from "@nestjs/passport";

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    handleRequest<TUser = any>(err: any, user: any, info: any, context: ExecutionContext, status?: any): TUser {
        if (info instanceof TokenExpiredError) {
            throw info; // Will be caught by your JwtExceptionFilter
        }
        if(info instanceof JsonWebTokenError) {
            throw info;
        }
        if (err || !user) {
            throw new UnauthorizedException('Custom unauthorized message');
        }
        return user;
    }
}