import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SprintResponseDto {
  @ApiProperty({ description: 'The ID of the sprint' })
  id: string;

  @ApiProperty({ description: 'The project ID this sprint belongs to' })
  projectId: string;

  @ApiProperty({ description: 'The name of the sprint' })
  name: string;

  @ApiPropertyOptional({ description: 'The goal of the sprint' })
  goal?: string | null;

  @ApiProperty({
    description: 'The status of the sprint',
    enum: ['PLANNED', 'ACTIVE', 'COMPLETED'],
  })
  status: string;

  @ApiPropertyOptional({ description: 'The start date of the sprint' })
  startDate?: Date | null;

  @ApiPropertyOptional({ description: 'The end date of the sprint' })
  endDate?: Date | null;

  @ApiPropertyOptional({ description: 'The completed date of the sprint' })
  completedAt?: Date | null;

  @ApiProperty({ description: 'The creation timestamp' })
  createdAt: Date;

  constructor(partial: Partial<SprintResponseDto>) {
    Object.assign(this, partial);
  }
}
