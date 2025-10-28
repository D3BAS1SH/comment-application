import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Query,
  Res,
  Req,
  BadRequestException,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { LoginUser } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import ms, { StringValue } from 'ms';
import { ValidUserDto } from './dto/valid-user-payload.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';
import { RefreshGuard } from './guards/refreh.guard';
import { RefreshTokenResponse } from './dto/refresh-token-reponse.dto';
import { ForgetPasswordBodyDto } from './dto/forget-password.dto';
import { ResetPasswordBodyDto } from './dto/reset-password.dto';

@Controller('users')
@UseInterceptors(CacheInterceptor) // Cache applied only to users endpoints
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly configService: ConfigService
  ) {}

  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }

  @Get('verify-email')
  async verifyUserEmail(@Query('token') token: string) {
    const verificationStatus = await this.usersService.verifyEmailToken(token);
    return verificationStatus;
  }

  @Post('login')
  async login(
    @Body() loginUser: LoginUser,
    @Res({ passthrough: true }) response: Response
  ) {
    const loginResponse = await this.usersService.login(loginUser);
    const expirationValue = this.configService.getOrThrow<StringValue>(
      'JWT_REFRESH_EXPIRATION'
    );
    const maxAgeMilisecondsRefreshToken = ms(expirationValue);
    response.cookie('refreshToken', loginResponse.refreshToken, {
      httpOnly: true,
      secure:
        this.configService.getOrThrow<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: maxAgeMilisecondsRefreshToken,
      path: '/',
    });
    console.log('Cookie set with refresh Token');
    return loginResponse;
  }

  @Post('refresh')
  @UseGuards(RefreshGuard)
  async refreshToken(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ) {
    console.log('-----------At refresh Controller-------');
    console.log(request.user);
    //convert the request.user to RefreshTokenRespones
    const validRefreshTokenPayload = request.user as RefreshTokenResponse;
    //Making a call to user service to refresh the token
    const refreshTokenResponse = await this.usersService.refreshMyToken(
      validRefreshTokenPayload
    );
    const expirationValue = this.configService.getOrThrow<StringValue>(
      'JWT_REFRESH_EXPIRATION'
    );
    const maxAgeMilisecondsRefreshToken = ms(expirationValue);
    response.cookie('refreshToken', refreshTokenResponse.refreshToken, {
      httpOnly: true,
      secure:
        this.configService.getOrThrow<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      maxAge: maxAgeMilisecondsRefreshToken,
      path: '/',
    });
    return refreshTokenResponse;
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logoutUser(
    @Req() request: Request,
    @Res({ passthrough: true }) response: Response
  ): Promise<{ message: string }> {
    const userPayload = request.user as ValidUserDto;
    // console.log(request.cookies);
    const accessToken = request.headers.authorization?.replace('Bearer ', '');
    if (!accessToken) {
      throw new BadRequestException(
        'Authorization field incorrect or not sent at all'
      );
    }
    // console.log(accessToken);
    const Result = await this.usersService.logout(userPayload, accessToken);
    response.clearCookie('refreshToken', {
      httpOnly: true,
      secure:
        this.configService.getOrThrow<string>('NODE_ENV') === 'production',
      sameSite: 'strict',
      path: '/',
    });
    return { message: Result ?? 'Logging Out Successful' };
  }

  @Post('forget-password')
  async forgetPasswordInitiate(
    @Body() uniqueIdentifier: ForgetPasswordBodyDto
  ) {
    const forgotPasswordInitiatorResult =
      await this.usersService.forgotPasswordInit(uniqueIdentifier);
    return forgotPasswordInitiatorResult;
  }

  @Post('reset-password')
  async resetPassword(@Body() resetPasswordBody: ResetPasswordBodyDto) {
    const response = await this.usersService.resetPassword(resetPasswordBody);
    return response;
  }
}
