import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt';
import { Request, Response } from 'express';
import { TokenService } from 'src/token/token.service';
import { CustomErrorResponseDto } from '../dto/error-response.dto';

@Injectable()
@Catch(TokenExpiredError, JsonWebTokenError)
export class JwtExceptionFilter implements ExceptionFilter {
  constructor(
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService
  ) {}
  async catch(
    exception: TokenExpiredError | JsonWebTokenError,
    host: ArgumentsHost
  ) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();

    const status = 401;
    let errorCode = 'UNAUTHORIZED';
    let message = 'Authentication Failed. Please login again';

    if (request.url.includes('/users/refresh')) {
      console.log('The Refrsh Token is either expired or invalid');
      const expiredToken =
        (request.cookies as { refreshToken?: string })?.refreshToken ??
        (request.body as { refreshToken?: string })?.refreshToken;
      if (expiredToken) {
        await this.tokenService.invalidateRefreshToken({
          refreshToken: expiredToken,
        });
        console.log('The expired Refresh Token is removed');
      }
      errorCode = 'SESSION_EXPIRED';
      message = 'Your session has expired. Please login again.';
      response.clearCookie('accessToken', {
        httpOnly: true,
        secure:
          this.configService.getOrThrow<string>('NODE_ENV') === 'production',
        sameSite: 'strict',
        path: '/',
      });
      response.clearCookie('refreshToken', {
        httpOnly: true,
        secure:
          this.configService.getOrThrow<string>('NODE_ENV') === 'production',
        sameSite: 'strict',
        path: '/',
      });
    } else {
      console.log('Jwt Access Token is expired or invalid');
      errorCode = 'ACCESS_TOKEN_EXPIRED';
      message = 'Access Token is expired. Please refresh your token';
    }

    console.log(
      '--------------------Error at JWT Exception--------------------'
    );
    console.log(`${exception.name}: ${exception.message}`);
    console.log(message);
    console.log(
      '--------------------Error at JWT Exception--------------------'
    );
    console.error(exception);
    console.log(
      '----------------END OF Error at JWT Exception-----------------'
    );

    response
      .status(status)
      .json(
        new CustomErrorResponseDto(status, request.url, message, errorCode)
      );
  }
}
