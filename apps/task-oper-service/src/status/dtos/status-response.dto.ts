import { ApiProperty } from '@nestjs/swagger';

export class StatusResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the status',
    example: 'c3d4e5f6-a7b8-9012-cdef-345678901234',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the project this status belongs to',
    example: 'f6a7b8c9-d0e1-2345-fabc-456789012345',
  })
  projectId: string;

  @ApiProperty({
    description: 'Display name of the status',
    example: 'In Progress',
  })
  name: string;

  @ApiProperty({
    description: 'Hex color code representing the status visually',
    example: '#F59E0B',
  })
  color: string;

  @ApiProperty({
    description: 'Numeric position used to order statuses within a project',
    example: 1,
  })
  position: number;

  @ApiProperty({
    description: 'Indicates whether this status represents a completed/done state',
    example: false,
  })
  isDone: boolean;

  @ApiProperty({
    description: 'Timestamp when the status was created',
    example: '2026-01-10T08:00:00.000Z',
  })
  createdAt: Date;

  constructor(partial: Partial<StatusResponseDto>) {
    Object.assign(this, partial);
  }
}
