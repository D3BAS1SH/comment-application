import { ApiProperty } from '@nestjs/swagger';
import { IssueResponseDto } from './issue-response.dto.js';

export class IssueListResponseDto {
  @ApiProperty({ type: [IssueResponseDto] })
  data: IssueResponseDto[];

  @ApiProperty()
  total: number;

  constructor(partial: Partial<IssueListResponseDto>) {
    Object.assign(this, partial);
  }
}
