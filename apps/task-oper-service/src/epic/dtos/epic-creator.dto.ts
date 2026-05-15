import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class EpicCreatorDto {
  @ApiProperty({ description: 'The user ID of the creator' })
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty({ description: 'First name of the creator' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ description: 'Last name of the creator' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ description: 'Email of the creator' })
  @IsString()
  @IsNotEmpty()
  email: string;

  @ApiPropertyOptional({ description: 'Avatar URL of the creator' })
  @IsString()
  @IsOptional()
  avatar?: string;

  constructor(partial: Partial<EpicCreatorDto>) {
    Object.assign(this, partial);
  }
}
