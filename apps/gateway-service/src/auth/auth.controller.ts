import { All, Controller, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@UseGuards(ThrottlerGuard)
@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService){}

    @Throttle({ auth: {} })
    @All('*')
    proxyAuthRequests(){}
}
