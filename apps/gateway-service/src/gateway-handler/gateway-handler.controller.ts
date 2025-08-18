import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { GatewayHandlerService } from './gateway-handler.service';
import { CreateGatewayHandlerDto } from './dto/create-gateway-handler.dto';
import { UpdateGatewayHandlerDto } from './dto/update-gateway-handler.dto';

@Controller('gateway-handler')
export class GatewayHandlerController {
  constructor(private readonly gatewayHandlerService: GatewayHandlerService) {}

  @Post()
  create(@Body() createGatewayHandlerDto: CreateGatewayHandlerDto) {
    return this.gatewayHandlerService.create(createGatewayHandlerDto);
  }

  @Get()
  findAll() {
    return this.gatewayHandlerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.gatewayHandlerService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateGatewayHandlerDto: UpdateGatewayHandlerDto) {
    return this.gatewayHandlerService.update(+id, updateGatewayHandlerDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.gatewayHandlerService.remove(+id);
  }
}
