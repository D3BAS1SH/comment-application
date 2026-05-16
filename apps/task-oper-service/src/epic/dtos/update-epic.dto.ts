import { PartialType } from '@nestjs/swagger';
import { CreateEpicDto } from './create-epic.dto.js';

export class UpdateEpicDto extends PartialType(CreateEpicDto) {
  constructor(partial: Partial<UpdateEpicDto>) {
    super();
    Object.assign(this, partial);
  }
}
