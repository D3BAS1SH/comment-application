import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IssueResponseDto, SimpleUserDto, SimpleStatusDto } from './issue-response.dto.js';
import { IssuePriority } from 'src/prisma/generated/enums.js';

export class SubTaskDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  issueNumber: number;

  @ApiProperty({ enum: IssuePriority })
  priority: IssuePriority;

  @ApiProperty({ type: () => SimpleStatusDto })
  status: SimpleStatusDto;

  @ApiPropertyOptional({ type: () => SimpleUserDto })
  assignee?: SimpleUserDto | null;
}

export class IssueCommentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  body: string;

  @ApiProperty({ type: () => SimpleUserDto })
  author: SimpleUserDto;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

export class IssueDetailResponseDto extends IssueResponseDto {
  @ApiProperty({ type: () => [SubTaskDto] })
  subTasks: SubTaskDto[];

  @ApiProperty({ type: () => [IssueCommentDto] })
  comments: IssueCommentDto[];

  constructor(partial: Partial<IssueDetailResponseDto>) {
    super(partial);
    Object.assign(this, partial);
  }
}
