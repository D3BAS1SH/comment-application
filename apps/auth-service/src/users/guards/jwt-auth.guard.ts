import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { TokenExpiredError, JsonWebTokenError } from '@nestjs/jwt';
import { AuthGuard } from '@nestjs/passport';
import { ValidUserDto } from '../dto/valid-user-payload.dto';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = ValidUserDto>(
    err: Error | null,
    user: TUser,
    info: any,
    _context: ExecutionContext,
    _status?: any,
  ): TUser {
    if (info instanceof TokenExpiredError) {
      throw info; // Will be caught by your JwtExceptionFilter
    }
    if (info instanceof JsonWebTokenError) {
      throw info;
    }
    if (err || !user) {
      throw new UnauthorizedException('Custom unauthorized message');
    }
    return user;
  }
}
