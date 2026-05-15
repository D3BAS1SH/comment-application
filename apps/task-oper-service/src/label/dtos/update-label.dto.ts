import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsHexColor, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateLabelDto {
  @ApiPropertyOptional({
    description: 'New display name for the label',
    example: 'Enhancement',
  })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated hex color code for the label',
    example: '#8B5CF6',
  })
  @IsString()
  @IsOptional()
  @IsHexColor()
  color?: string;

  constructor(partial: Partial<UpdateLabelDto>) {
    Object.assign(this, partial);
  }
}
