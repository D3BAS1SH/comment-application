import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class UpdateSprintDto {
  @ApiPropertyOptional({
    description: 'The name of the sprint',
    example: 'Sprint 1',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  name?: string;

  @ApiPropertyOptional({
    description: 'An optional goal for the sprint',
    example: 'Deliver authentication module',
  })
  @IsString()
  @IsOptional()
  goal?: string;

  @ApiPropertyOptional({
    description: 'The start date of the sprint',
    example: '2026-05-16T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'The end date of the sprint',
    example: '2026-05-30T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  constructor(partial: Partial<UpdateSprintDto>) {
    Object.assign(this, partial);
  }
}
