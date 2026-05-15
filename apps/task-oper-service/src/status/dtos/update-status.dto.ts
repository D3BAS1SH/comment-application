import { ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsHexColor,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class UpdateStatusDto {
  @ApiPropertyOptional({
    description: 'New display name for the status',
    example: 'Under Review',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated hex color code for the status',
    example: '#8B5CF6',
  })
  @IsString()
  @IsOptional()
  @IsHexColor()
  color?: string;

  @ApiPropertyOptional({
    description: 'Updated numeric position to reorder this status (must be ≥ 0)',
    example: 2,
  })
  @IsNumber()
  @IsOptional()
  @Min(0)
  position?: number;

  @ApiPropertyOptional({
    description: 'Toggle whether this status represents a completed/done state',
    example: true,
  })
  @IsBoolean()
  @IsOptional()
  isDone?: boolean;

  constructor(partial: Partial<UpdateStatusDto>) {
    Object.assign(this, partial);
  }
}
