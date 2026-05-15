import { ApiProperty } from '@nestjs/swagger';

export class LabelResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the label',
    example: 'b2c3d4e5-f6a7-8901-bcde-234567890123',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the project this label belongs to',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  projectId: string;

  @ApiProperty({
    description: 'Display name of the label',
    example: 'Bug',
  })
  name: string;

  @ApiProperty({
    description: 'Hex color code representing the label visually',
    example: '#EF4444',
  })
  color: string;

  constructor(partial: Partial<LabelResponseDto>) {
    Object.assign(this, partial);
  }
}
