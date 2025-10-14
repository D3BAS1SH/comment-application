import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { tokenPayload } from '../interfaces/token-payload.interface';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_ACCESS_SECRET')!,
      passReqToCallback: true,
    });
  }

  async validate(payload: tokenPayload): Promise<tokenPayload> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: payload.sub,
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('User not Found');
    }

    return payload;
  }
}
