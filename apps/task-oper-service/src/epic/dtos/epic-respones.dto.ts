import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ValidateNested } from 'class-validator';
import { EpicCreatorDto } from './epic-creator.dto.js';

export class EpicResponseDto {
  @ApiProperty({ description: 'The ID of the epic' })
  id: string;

  @ApiProperty({ description: 'The project ID this epic belongs to' })
  projectId: string;

  @ApiProperty({ description: 'The title of the epic' })
  title: string;

  @ApiPropertyOptional({ description: 'The description of the epic' })
  description?: string;

  @ApiPropertyOptional({ description: 'The hex color code for the epic' })
  color?: string;

  @ApiPropertyOptional({ description: 'The start date of the epic' })
  startDate?: Date;

  @ApiPropertyOptional({ description: 'The end date of the epic' })
  endDate?: Date;

  @ApiProperty({ description: 'The creation timestamp' })
  createdAt: Date;

  @ApiProperty({ description: 'The user ID who created the epic' })
  createdBy: string;

  @ApiPropertyOptional({
    description: 'The creator of the epic',
    type: () => EpicCreatorDto,
  })
  @ValidateNested()
  @Type(() => EpicCreatorDto)
  creator?: EpicCreatorDto;

  constructor(partial: Partial<EpicResponseDto>) {
    Object.assign(this, partial);
    if (partial.creator) {
      this.creator = new EpicCreatorDto(partial.creator);
    }
  }
}
