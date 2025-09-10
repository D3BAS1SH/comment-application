import { Module} from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { AuthProxyMiddleware } from './auth-proxy.middleware';
import { LoggerService } from 'src/common/log/logger.service';

@Module({
  imports:[
    HttpModule,
    ConfigModule,
  ],
  providers: [
    LoggerService,
    AuthProxyMiddleware
  ],
  exports: [AuthProxyMiddleware]
})
export class AuthModule {}
