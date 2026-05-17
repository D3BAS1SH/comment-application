import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IssuePriority } from '../../prisma/generated/enums.js';

export class SimpleUserDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  email: string;

  @ApiPropertyOptional()
  avatar?: string;
}

export class SimpleStatusDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  color: string;
}

export class SimpleLabelDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  color: string;
}

export class IssueResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  workspaceId: string;

  @ApiProperty()
  projectId: string;

  @ApiProperty()
  issueNumber: number;

  @ApiProperty()
  title: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiProperty({ enum: IssuePriority })
  priority: IssuePriority;

  @ApiProperty()
  position: number;

  @ApiProperty()
  statusId: string;

  @ApiPropertyOptional()
  epicId?: string;

  @ApiPropertyOptional()
  sprintId?: string;

  @ApiPropertyOptional()
  assigneeId?: string;

  @ApiProperty()
  reporterId: string;

  @ApiPropertyOptional()
  parentId?: string;

  @ApiPropertyOptional()
  dueDate?: Date;

  @ApiPropertyOptional()
  startedDate?: Date;

  @ApiPropertyOptional()
  completedDate?: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => SimpleStatusDto })
  status: SimpleStatusDto;

  @ApiPropertyOptional({ type: () => SimpleUserDto })
  assignee?: SimpleUserDto | null;

  @ApiProperty({ type: () => SimpleUserDto })
  reporter: SimpleUserDto;

  @ApiPropertyOptional({ type: () => [SimpleLabelDto] })
  labels?: SimpleLabelDto[];

  constructor(partial: Partial<IssueResponseDto>) {
    Object.assign(this, partial);
  }
}
