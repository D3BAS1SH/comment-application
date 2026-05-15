import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectLeadDto } from './project-detail.dto.js';

export class ProjectListItemDto {
  @ApiProperty({ example: 'f6a7b8c9-d0e1-2345-fabc-456789012345' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workspaceId: string;

  @ApiProperty({ example: 'My Awesome Project' })
  name: string;

  @ApiProperty({
    description: 'Short unique key used as a prefix for issue identifiers',
    example: 'MAP',
  })
  key: string;

  @ApiPropertyOptional({
    example: 'This project tracks all tasks for the awesome product.',
  })
  description?: string | null;

  @ApiProperty({
    description: 'Total number of issues ever created in this project',
    example: 42,
  })
  lastIssueNumber: number;

  @ApiProperty({ example: '2026-01-10T08:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'Brief info about the project lead',
    type: () => ProjectLeadDto,
  })
  lead?: ProjectLeadDto | null;

  constructor(partial: Partial<ProjectListItemDto>) {
    Object.assign(this, partial);
  }
}
