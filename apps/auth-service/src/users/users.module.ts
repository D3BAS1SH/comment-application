import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from 'src/prisma/prisma.module';
import { PassportModule } from '@nestjs/passport';
import { TokenModule } from 'src/token/token.module';
import { EmailModule } from 'src/email/email.module';
import { ConfigModule } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { RefreshStrategy } from './strategies/refresh.strategy';

@Module({
  imports: [
    PrismaModule,
    PassportModule.register({
      defaultStrategy: 'jwt',
    }),
    TokenModule,
    EmailModule,
    ConfigModule,
  ],
  controllers: [UsersController],
  providers: [UsersService, JwtStrategy, RefreshStrategy],
  exports: [UsersService],
})
export class UsersModule {}
