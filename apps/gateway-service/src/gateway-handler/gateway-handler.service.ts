import { Injectable } from '@nestjs/common';
import { CreateGatewayHandlerDto } from './dto/create-gateway-handler.dto';
import { UpdateGatewayHandlerDto } from './dto/update-gateway-handler.dto';

@Injectable()
export class GatewayHandlerService {
  create(createGatewayHandlerDto: CreateGatewayHandlerDto) {
    return 'This action adds a new gatewayHandler';
  }

  findAll() {
    return `This action returns all gatewayHandler`;
  }

  findOne(id: number) {
    return `This action returns a #${id} gatewayHandler`;
  }

  update(id: number, updateGatewayHandlerDto: UpdateGatewayHandlerDto) {
    return `This action updates a #${id} gatewayHandler`;
  }

  remove(id: number) {
    return `This action removes a #${id} gatewayHandler`;
  }
}
