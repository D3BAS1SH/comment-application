import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { SprintResponseDto } from './sprint-response.dto.js';

export class SprintListResponseDto {
  @ApiProperty({
    description: 'List of sprints',
    type: () => [SprintResponseDto],
  })
  @ValidateNested({ each: true })
  @Type(() => SprintResponseDto)
  data: SprintResponseDto[];

  @ApiProperty({ description: 'Total count of sprints' })
  total: number;

  constructor(partial: Partial<SprintListResponseDto>) {
    Object.assign(this, partial);
    if (partial.data) {
      this.data = partial.data.map((sprint) => new SprintResponseDto(sprint));
    }
  }
}
