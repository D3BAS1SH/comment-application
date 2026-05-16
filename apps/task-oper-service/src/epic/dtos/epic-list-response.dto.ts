import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { EpicResponseDto } from './epic-respones.dto.js';

export class EpicListResponseDto {
  @ApiProperty({
    description: 'The list of epics',
    type: [EpicResponseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => EpicResponseDto)
  data: EpicResponseDto[];

  @ApiProperty({
    description: 'Total number of epics',
    example: 10,
  })
  total: number;

  constructor(partial: Partial<EpicListResponseDto>) {
    Object.assign(this, partial);
    if (partial.data) {
      this.data = partial.data.map((epic) => new EpicResponseDto(epic));
    }
  }
}
