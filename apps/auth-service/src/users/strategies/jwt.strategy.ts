import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { plainToInstance } from 'class-transformer';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { ValidUserDto } from '../dto/valid-user-payload.dto';
import { tokenPayload } from 'src/token/interfaces/token-payload.interface';
import { Request } from 'express';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request): string | null => {
          if (req && req.cookies) {
            return (
              req.cookies as { refreshToken: string; accessToken: string }
            ).accessToken;
          }
          return null;
        },
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
      passReqToCallback: true,
    });
    console.log('🔍 JwtStrategy - CacheManager injected:', !!this.cacheManager);
    console.log(
      '🔍 JwtStrategy - CacheManager type:',
      typeof this.cacheManager
    );
  }

  /**
   * Validates the JWT payload and retrieves the user information.
   * @param req - The request object.
   * @param payload - The JWT payload containing user information.
   * @returns The validated user information.
   */
  async validate(req: any, payload: tokenPayload): Promise<ValidUserDto> {
    const accessToken = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!accessToken) {
      throw new UnauthorizedException('Token not found');
    }
    const tokenToCheck = `BL:${accessToken.trim()}`;
    // console.log("token to check : ");
    // console.log(tokenToCheck);
    // console.log('=== END CACHE DEBUG ===');
    const isBlacklisted = await this.cacheManager.get(tokenToCheck);
    console.log(isBlacklisted);
    if (isBlacklisted) {
      throw new UnauthorizedException(
        'You are unauthorized to access as the token is revoked and you have been logged out'
      );
    }
    console.log(`Is blacklited? : ${!!isBlacklisted}`);

    // console.log("Hitting prisma Query");
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (!user.isVerified) {
      throw new UnauthorizedException(
        'User is not verified. Please Check your inbox or verify yourself.'
      );
    }

    if (user.deletedAt) {
      throw new UnauthorizedException('User is deleted or deactive');
    }
    return plainToInstance(
      ValidUserDto,
      { ...user, ...payload },
      {
        excludeExtraneousValues: true,
      }
    );
  }
}
