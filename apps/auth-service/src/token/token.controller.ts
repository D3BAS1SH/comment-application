import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { TokenService } from './token.service';
import { CreateTokenDto } from './dto/create-token.dto';
import { UpdateTokenDto } from './dto/update-token.dto';
import { ThrottlerGuard } from '@nestjs/throttler';

@Controller('token')
export class TokenController {
  constructor(private readonly tokenService: TokenService) {}

}
