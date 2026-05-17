import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class MoveSprintDto {
  @ApiPropertyOptional({
    description:
      'The ID of the sprint to move the issue to. Null to move to backlog.',
    example: 'sprint-123',
    nullable: true,
  })
  @IsString()
  @IsOptional()
  sprintId: string | null;

  constructor(partial: Partial<MoveSprintDto>) {
    Object.assign(this, partial);
  }
}
