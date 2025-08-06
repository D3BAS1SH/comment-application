import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Query, Res, Req, UnauthorizedException, BadRequestException, UseInterceptors } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { Request, Response } from 'express';
import { LoginUser } from './dto/login-user.dto';
import { ConfigService } from '@nestjs/config';
import * as ms from 'ms';
import { ValidUserDto } from './dto/valid-user-payload.dto';
import { CacheInterceptor } from '@nestjs/cache-manager';

@Controller('users')
@UseInterceptors(CacheInterceptor)
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly configService: ConfigService) {}

  @Post('register')
  async registerUser(@Body() createUserDto: CreateUserDto) {
    try {
      console.log(createUserDto);
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw error;
    }
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  findAll() {
    return this.usersService.findAll();
  }

  @Get('verify-email')
  async verifyUserEmail(@Query('token') token: string,) {
    const verificationStatus = await this.usersService.verifyEmailToken(token);
    return verificationStatus;
  }

  @Post('login')
  async login(@Body() loginUser:LoginUser,@Res({passthrough: true}) response: Response) {
    try {
      const loginResponse = await this.usersService.login(loginUser);
      const expirationValue = this.configService.get('JWT_REFRESH_EXPIRATION');
      const maxAgeMilisecondsRefreshToken = ms(expirationValue);
      response.cookie('refreshToken', loginResponse.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: maxAgeMilisecondsRefreshToken,
        path: '/',
      });
      console.log("Cookie set with refresh Token");
      return loginResponse;
    } catch (error) {
      throw error;
    }
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  async logoutUser(
    @Req() request: Request,
    @Res({passthrough: true}) response: Response
  ):Promise<{message: string}>{
    try {
      const userPayload = request.user as ValidUserDto;
      console.log(userPayload);
      if(!userPayload){
        throw new UnauthorizedException(`User is unauthenticated or lost validity or token is failed to verify`);
      }
      console.log(request.cookies);
      const accessToken = request.headers.authorization?.replace('Bearer ', '');
      if(!accessToken){
        throw new BadRequestException('Authorization field incorrect or not sent at all');
      }
      console.log(accessToken);
      const Result = await this.usersService.logout(userPayload, accessToken);
      response.clearCookie('refreshToken')
      return {message:Result ?? "Logging Out Successful"};
    } catch (error) {
      throw error;
    }
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.usersService.remove(+id);
  }
}
