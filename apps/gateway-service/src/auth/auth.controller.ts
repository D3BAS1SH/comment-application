import { All, Controller, Next, Req, Res, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { NextFunction, Request, Response } from 'express';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Authentication')
@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
  @ApiOperation({ summary: 'Proxy all auth requests to auth service' })
  @ApiResponse({
    status: 200,
    description: 'Request successfully proxied',
    type: Object,
  })
  @ApiResponse({
    status: 503,
    description: 'Auth service unavailable',
    type: Object,
  })
  @Throttle({ auth: {} })
  @All('*')
  proxyAuthRequests(
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ) {
    next();
  }
}
