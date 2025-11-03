import { BadRequestException, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { RefreshTokenResponse } from '../dto/refresh-token-reponse.dto';
import { Request } from 'express';
import { tokenPayload } from 'src/token/interfaces/token-payload.interface';

@Injectable()
export class RefreshStrategy extends PassportStrategy(Strategy, 'jwt-refresh') {
  constructor(private readonly configService: ConfigService) {
    super({
      secretOrKey: configService.getOrThrow<string>('JWT_REFRESH_SECRET'),
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => {
          if (req && req.cookies) {
            return (
              req.cookies as { refreshToken: string; accessToken: string }
            ).refreshToken;
          }
          return null;
        },
        (req: Request) => {
          if (req && req.body) {
            return (req.body as { refreshToken: string }).refreshToken;
          }
          return null;
        },
      ]),
      ignoreExpiration: false,
      passReqToCallback: true,
    });
  }

  validate(req: Request, payload: tokenPayload): RefreshTokenResponse {
    console.log('validated payload');
    let refreshToken: string;
    if (req.cookies) {
      refreshToken = (req.cookies as { refreshToken: string }).refreshToken;
    } else if (req.body) {
      refreshToken = (req.body as { refreshToken: string }).refreshToken;
    } else {
      throw new BadRequestException('RefreshToken not found');
    }
    if (!refreshToken) {
      throw new BadRequestException('The refresh Token was not found');
    }

    return {
      email: payload.email,
      exp: payload.exp,
      iat: payload.iat,
      isVerified: payload.isVerified,
      sessionToken: payload.sessionToken,
      sub: payload.sub,
      refreshToken: refreshToken,
    };
  }
}
