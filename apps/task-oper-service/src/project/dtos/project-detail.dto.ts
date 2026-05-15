import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ─── Nested: Project Lead (User) ────────────────────────────────────────────

export class ProjectLeadDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  id: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiPropertyOptional({ example: 'https://cdn.example.com/avatars/john.png' })
  avatar?: string | null;

  constructor(partial: Partial<ProjectLeadDto>) {
    Object.assign(this, partial);
  }
}

// ─── Nested: Status ─────────────────────────────────────────────────────────

export class ProjectStatusDto {
  @ApiProperty({ example: 'b2c3d4e5-f6a7-8901-bcde-f12345678901' })
  id: string;

  @ApiProperty({ example: 'In Progress' })
  name: string;

  @ApiProperty({ example: '#3B82F6' })
  color: string;

  @ApiProperty({ example: 1.0 })
  position: number;

  @ApiProperty({ example: false })
  isDone: boolean;

  @ApiProperty({ example: '2026-01-15T10:00:00.000Z' })
  createdAt: Date;

  constructor(partial: Partial<ProjectStatusDto>) {
    Object.assign(this, partial);
  }
}

// ─── Nested: Label ──────────────────────────────────────────────────────────

export class ProjectLabelDto {
  @ApiProperty({ example: 'c3d4e5f6-a7b8-9012-cdef-123456789012' })
  id: string;

  @ApiProperty({ example: 'Bug' })
  name: string;

  @ApiProperty({ example: '#EF4444' })
  color: string;

  constructor(partial: Partial<ProjectLabelDto>) {
    Object.assign(this, partial);
  }
}

// ─── Nested: Epic ───────────────────────────────────────────────────────────

export class ProjectEpicDto {
  @ApiProperty({ example: 'd4e5f6a7-b8c9-0123-defa-234567890123' })
  id: string;

  @ApiProperty({ example: 'User Authentication' })
  title: string;

  @ApiPropertyOptional({
    example: 'Covers all login, signup, and OAuth flows.',
  })
  description?: string | null;

  @ApiPropertyOptional({ example: '#8B5CF6' })
  color?: string | null;

  @ApiPropertyOptional({ example: '2026-01-01T00:00:00.000Z' })
  startDate?: Date | null;

  @ApiPropertyOptional({ example: '2026-03-31T00:00:00.000Z' })
  endDate?: Date | null;

  @ApiProperty({ example: '2026-01-10T08:00:00.000Z' })
  createdAt: Date;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  createdBy: string;

  constructor(partial: Partial<ProjectEpicDto>) {
    Object.assign(this, partial);
  }
}

// ─── Nested: Sprint ─────────────────────────────────────────────────────────

export class ProjectSprintDto {
  @ApiProperty({ example: 'e5f6a7b8-c9d0-1234-efab-345678901234' })
  id: string;

  @ApiProperty({ example: 'Sprint 1' })
  name: string;

  @ApiPropertyOptional({ example: 'Deliver the MVP authentication feature.' })
  goal?: string | null;

  @ApiProperty({ enum: ['PLANNED', 'ACTIVE', 'COMPLETED'], example: 'ACTIVE' })
  status: string;

  @ApiPropertyOptional({ example: '2026-01-15T00:00:00.000Z' })
  startDate?: Date | null;

  @ApiPropertyOptional({ example: '2026-01-29T00:00:00.000Z' })
  endDate?: Date | null;

  @ApiPropertyOptional({ example: null })
  completedAt?: Date | null;

  @ApiProperty({ example: '2026-01-14T12:00:00.000Z' })
  createdAt: Date;

  constructor(partial: Partial<ProjectSprintDto>) {
    Object.assign(this, partial);
  }
}

// ─── Main: Project Detail ────────────────────────────────────────────────────

export class ProjectDetailDto {
  @ApiProperty({ example: 'f6a7b8c9-d0e1-2345-fabc-456789012345' })
  id: string;

  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  workspaceId: string;

  @ApiProperty({ example: 'My Awesome Project' })
  name: string;

  @ApiProperty({ example: 'MAP' })
  key: string;

  @ApiPropertyOptional({
    example: 'This project tracks all tasks for the awesome product.',
  })
  description?: string | null;

  @ApiProperty({ example: 42 })
  lastIssueNumber: number;

  @ApiProperty({ example: '2026-01-10T08:00:00.000Z' })
  createdAt: Date;

  @ApiPropertyOptional({
    description: 'The project lead user details',
    type: () => ProjectLeadDto,
  })
  lead?: ProjectLeadDto | null;

  @ApiProperty({
    description: 'All statuses defined in this project',
    type: () => [ProjectStatusDto],
  })
  statuses: ProjectStatusDto[];

  @ApiProperty({
    description: 'All labels defined in this project',
    type: () => [ProjectLabelDto],
  })
  labels: ProjectLabelDto[];

  @ApiProperty({
    description: 'All epics in this project',
    type: () => [ProjectEpicDto],
  })
  epics: ProjectEpicDto[];

  @ApiProperty({
    description: 'All sprints in this project',
    type: () => [ProjectSprintDto],
  })
  sprints: ProjectSprintDto[];

  constructor(partial: Partial<ProjectDetailDto>) {
    Object.assign(this, partial);
  }
}
