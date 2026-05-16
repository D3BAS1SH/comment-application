import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsDateString, IsOptional } from 'class-validator';

export class StartSprintDto {
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

  constructor(partial: Partial<StartSprintDto>) {
    Object.assign(this, partial);
  }
}
