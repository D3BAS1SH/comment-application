import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ActivityType } from '../../prisma/generated/enums.js';
import { SimpleUserDto } from './issue-response.dto.js';

export class IssueActivityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  issueId: string;

  @ApiProperty()
  actorId: string;

  @ApiProperty({ enum: ActivityType })
  type: ActivityType;

  @ApiPropertyOptional()
  oldValue?: string;

  @ApiPropertyOptional()
  newValue?: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({ type: () => SimpleUserDto })
  actor: SimpleUserDto;

  constructor(partial: Partial<IssueActivityResponseDto>) {
    Object.assign(this, partial);
  }
}
