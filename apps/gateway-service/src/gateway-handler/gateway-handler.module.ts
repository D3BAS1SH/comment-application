import { Module } from '@nestjs/common';
import { GatewayHandlerService } from './gateway-handler.service';
import { GatewayHandlerController } from './gateway-handler.controller';

@Module({
  controllers: [GatewayHandlerController],
  providers: [GatewayHandlerService],
})
export class GatewayHandlerModule {}
