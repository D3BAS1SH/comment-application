import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class CreateEpicDto {
  @ApiProperty({
    description: 'The title of the epic',
    example: 'Implement Authentication',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({
    description: 'An optional description of the epic',
    example: 'This epic covers all authentication and authorization tasks.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'The hex color code for the epic',
    example: '#FF5733',
  })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  color?: string;

  @ApiPropertyOptional({
    description: 'The start date of the epic',
    example: '2026-05-16T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  startDate?: string;

  @ApiPropertyOptional({
    description: 'The end date of the epic',
    example: '2026-06-16T00:00:00Z',
  })
  @IsDateString()
  @IsOptional()
  endDate?: string;

  constructor(partial: Partial<CreateEpicDto>) {
    Object.assign(this, partial);
  }
}
