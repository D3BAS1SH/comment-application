import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { IssuePriority } from '../../prisma/generated/enums.js';

export class CreateIssueDto {
  @ApiProperty({ description: 'The title of the issue' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ description: 'The description of the issue' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    enum: IssuePriority,
    description: 'The priority of the issue',
  })
  @IsEnum(IssuePriority)
  @IsOptional()
  priority?: IssuePriority;

  @ApiProperty({ description: 'The ID of the status' })
  @IsString()
  @IsNotEmpty()
  statusId: string;

  @ApiPropertyOptional({ description: 'The ID of the epic' })
  @IsString()
  @IsOptional()
  epicId?: string;

  @ApiPropertyOptional({ description: 'The ID of the sprint' })
  @IsString()
  @IsOptional()
  sprintId?: string;

  @ApiPropertyOptional({ description: 'The ID of the assignee user' })
  @IsString()
  @IsOptional()
  assigneeId?: string;

  @ApiPropertyOptional({ description: 'The ID of the parent issue' })
  @IsString()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ description: 'The due date of the issue' })
  @IsDateString()
  @IsOptional()
  dueDate?: Date;

  @ApiPropertyOptional({
    description: 'The labels attached to the issue',
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  labelIds?: string[];

  constructor(partial: Partial<CreateIssueDto>) {
    Object.assign(this, partial);
  }
}
