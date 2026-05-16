import { ApiProperty } from '@nestjs/swagger';
import { IssueActivityResponseDto } from './issue-activity-response.dto.js';

export class IssueActivityListResponseDto {
  @ApiProperty({ type: [IssueActivityResponseDto] })
  data: IssueActivityResponseDto[];

  @ApiProperty()
  total: number;

  constructor(partial: Partial<IssueActivityListResponseDto>) {
    Object.assign(this, partial);
  }
}
