import { ApiProperty } from '@nestjs/swagger';
import { IsHexColor, IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateLabelDto {
  @ApiProperty({
    description: 'Display name of the label',
    example: 'Bug',
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name: string;

  @ApiProperty({
    description: 'Hex color code representing the label visually',
    example: '#EF4444',
  })
  @IsString()
  @IsNotEmpty()
  @IsHexColor()
  color: string;

  constructor(partial: Partial<CreateLabelDto>) {
    Object.assign(this, partial);
  }
}
