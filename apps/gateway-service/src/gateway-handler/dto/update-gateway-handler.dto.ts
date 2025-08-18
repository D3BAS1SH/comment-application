import { PartialType } from '@nestjs/swagger';
import { CreateGatewayHandlerDto } from './create-gateway-handler.dto';

export class UpdateGatewayHandlerDto extends PartialType(CreateGatewayHandlerDto) {}
