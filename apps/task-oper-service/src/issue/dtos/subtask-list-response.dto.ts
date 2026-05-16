import { ApiProperty } from '@nestjs/swagger';
import { SubTaskDto } from './issue-detail-response.dto.js';

export class SubTaskListResponseDto {
  @ApiProperty({ type: () => [SubTaskDto] })
  subTasks: SubTaskDto[];

  @ApiProperty()
  total: number;

  constructor(partial: Partial<SubTaskListResponseDto>) {
    Object.assign(this, partial);
  }
}
