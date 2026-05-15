import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, MaxLength } from 'class-validator';

export class CreateProjectDto {
  @ApiProperty({
    description: 'The name of the project',
    example: 'My Awesome Project',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  name: string;

  @ApiProperty({
    description:
      'A short, unique key identifier for the project (e.g. used as issue prefix)',
    example: 'MAP',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(10)
  key: string;

  @ApiPropertyOptional({
    description: 'An optional description of the project',
    example: 'This project tracks all tasks for the awesome product.',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'The user ID of the project lead',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsString()
  @IsOptional()
  leadId?: string;

  constructor(partial: Partial<CreateProjectDto>) {
    Object.assign(this, partial);
  }
}
