import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsBoolean,
  IsHexColor,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator';

export class CreateStatusDto {
  @ApiProperty({
    description: 'Display name of the status',
    example: 'In Progress',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Hex color code representing the status visually',
    example: '#F59E0B',
  })
  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  color: string;

  @ApiProperty({
    description: 'Numeric position used to order statuses within a project (must be ≥ 0)',
    example: 1,
  })
  @IsNumber()
  @Min(0)
  position: number;

  @ApiPropertyOptional({
    description: 'Marks this status as a "done" state (e.g. Closed, Resolved)',
    example: false,
    default: false,
  })
  @IsBoolean()
  @IsOptional()
  isDone?: boolean;

  constructor(partial: Partial<CreateStatusDto>) {
    Object.assign(this, partial);
  }
}
