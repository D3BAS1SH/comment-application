import { ApiProperty } from '@nestjs/swagger';
import { IssueCommentDto } from './issue-detail-response.dto.js';

export class IssueCommentListResponseDto {
  @ApiProperty({ type: () => [IssueCommentDto] })
  comments: IssueCommentDto[];

  @ApiProperty()
  total: number;

  constructor(partial: Partial<IssueCommentListResponseDto>) {
    Object.assign(this, partial);
  }
}
